import { z } from "zod";
import { protectedProcedure, publicProcedure } from "../lib/orpc";
import { Review } from "../db/models/review.model";
import { Show } from "../db/models/show.model";
import { User } from "../db/models/auth.model";
import mongoose from "mongoose";
import { connectDB } from "../db";

export const reviewRouter = {
	// Get all reviews for an anime
	getByAnimeId: publicProcedure
		.input(z.object({
			animeId: z.string(),
			limit: z.number().optional().default(50),
			skip: z.number().optional().default(0),
		}))
		.handler(async ({ input }) => {
			try {
				console.log('🔍 Fetching reviews for animeId:', input.animeId);
				console.log('🔍 Query params:', { limit: input.limit, skip: input.skip });
				
				// Ensure database connection
				await connectDB();
				console.log('🔍 MongoDB connection state:', mongoose.connection.readyState);
				console.log('🔍 Review model:', Review ? 'Available' : 'Not available');
				
				// Fetch reviews and manually populate user data
				const reviews = await Review.find({ animeId: input.animeId })
					.sort({ createdAt: -1 })
					.limit(input.limit)
					.skip(input.skip)
					.lean();
				
				console.log('✅ Found reviews for animeId', input.animeId, ':', reviews.length);
				
				// Manually populate user data with enhanced debugging
				const reviewsWithUsers = await Promise.all(
					reviews.map(async (review: any) => {
						try {
							// Handle both ObjectId and String user IDs
							let userId = review.user;
							
							// Enhanced debugging for first review
							const isFirstReview = reviews.indexOf(review) === 0;
							
							if (isFirstReview) {
								console.log('🔍 DETAILED ID ANALYSIS FOR FIRST REVIEW:');
								console.log('  - Raw userId:', userId);
								console.log('  - userId type:', typeof userId);
								console.log('  - userId constructor:', userId?.constructor?.name);
								console.log('  - userId toString():', userId?.toString?.());
								console.log('  - JSON.stringify(userId):', JSON.stringify(userId));
								console.log('  - userId length (raw):', userId?.length);
								console.log('  - userId length (string):', String(userId)?.length);
								
								// Check for whitespace issues
								const userIdStr = String(userId);
								console.log('  - Has leading space:', userIdStr !== userIdStr.trimStart());
								console.log('  - Has trailing space:', userIdStr !== userIdStr.trimEnd());
								console.log('  - Trimmed:', userIdStr.trim());
								console.log('  - Trimmed length:', userIdStr.trim().length);
							}
							
							// Convert to string if needed
							if (userId && typeof userId === 'object' && userId.toString) {
								userId = userId.toString();
							}
							
							// Try multiple lookup strategies
							let user = null;
							
							// Strategy 1: Direct lookup
							user = await User.findOne({ _id: userId }).select('name email').lean();
							if (isFirstReview) console.log('👤 Strategy 1 (direct):', user ? '✅ Found' : '❌ Not found');
							
							// Strategy 2: Trimmed lookup
							if (!user && typeof userId === 'string') {
								user = await User.findOne({ _id: userId.trim() }).select('name email').lean();
								if (isFirstReview) console.log('👤 Strategy 2 (trimmed):', user ? '✅ Found' : '❌ Not found');
							}
							
							// Strategy 3: Case-insensitive lookup (if string looks like ObjectId)
							if (!user && typeof userId === 'string' && userId.length === 24) {
								user = await User.findOne({ _id: { $regex: new RegExp(`^${userId}$`, 'i') } }).select('name email').lean();
								if (isFirstReview) console.log('👤 Strategy 3 (case-insensitive):', user ? '✅ Found' : '❌ Not found');
							}
							
							// Strategy 4: Try as ObjectId (if User schema actually stores ObjectIds despite saying String)
							if (!user && typeof userId === 'string' && mongoose.Types.ObjectId.isValid(userId)) {
								try {
									const objectIdUserId = new mongoose.Types.ObjectId(userId);
									user = await User.findOne({ _id: objectIdUserId }).select('name email').lean();
									if (isFirstReview) console.log('👤 Strategy 4 (as ObjectId):', user ? '✅ Found' : '❌ Not found');
								} catch (err) {
									if (isFirstReview) console.log('👤 Strategy 4 (as ObjectId): ❌ Error converting to ObjectId');
								}
							}
							
							// Strategy 5: If review.user is already an ObjectId object, use it directly
							if (!user && review.user && typeof review.user === 'object' && review.user._bsontype === 'ObjectId') {
								user = await User.findOne({ _id: review.user }).select('name email').lean();
								if (isFirstReview) console.log('👤 Strategy 5 (direct ObjectId):', user ? '✅ Found' : '❌ Not found');
							}
							
							// Debug: Show sample users on first review if still not found
							if (!user && isFirstReview) {
								const sampleUsers = await User.find({}).limit(5).select('_id name').lean();
								console.log('👥 Sample users in database:');
								sampleUsers.forEach((u: any) => {
									console.log(`  - ID: "${u._id}" (type: ${typeof u._id}, len: ${String(u._id).length}), Name: ${u.name}`);
									
									// Try to match
									const match = String(u._id) === String(userId);
									const matchTrimmed = String(u._id).trim() === String(userId).trim();
									console.log(`    Match check: exact=${match}, trimmed=${matchTrimmed}`);
								});
								
								console.log('👥 Looking for userId:', `"${userId}" (type: ${typeof userId}, len: ${String(userId).length})`);
							}
							
							// Final result
							if (user) {
								if (isFirstReview) console.log('✅ Successfully found user:', (user as any).name);
							} else {
								if (isFirstReview) console.log('❌ Failed to find user for ID:', userId);
							}
							
							return {
								...review,
								user: user || { name: 'Unknown User', email: '' }
							};
						} catch (error) {
							console.error('❌ Error populating user for review:', review._id, error);
							return {
								...review,
								user: { name: 'Unknown User', email: '' }
							};
						}
					})
				);
				
				return reviewsWithUsers;
			} catch (error: any) {
				console.error('❌ Error fetching reviews:', error);
				console.error('❌ Error message:', error?.message);
				console.error('❌ Error stack:', error?.stack);
				// Re-throw the original error to preserve the stack trace
				throw error;
			}
		}),

	// Get user's own reviews
	getMyReviews: protectedProcedure
		.input(z.object({
			limit: z.number().optional().default(50),
			skip: z.number().optional().default(0),
		}))
		.handler(async ({ input, context }) => {
			const userId = context.session?.user?.id;
			
			const reviews = await Review.find({ user: userId })
				.sort({ createdAt: -1 })
				.limit(input.limit)
				.skip(input.skip)
				.lean();
			
			return reviews;
		}),

	// Get single review by ID
	getById: publicProcedure
		.input(z.object({
			id: z.string(),
		}))
		.handler(async ({ input }) => {
			if (!mongoose.Types.ObjectId.isValid(input.id)) {
				throw new Error("Invalid review ID");
			}
			
			const review = await Review.findById(input.id).lean() as any;
			
			if (!review) {
				throw new Error("Review not found");
			}
			
			// Manually populate user data
			try {
				// Handle both ObjectId and String user IDs
				let userId = review.user;
				if (userId && typeof userId === 'object' && userId.toString) {
					userId = userId.toString();
				}
				
				const user = await User.findOne({ _id: userId }).select('name email').lean();
				review.user = user || { name: 'Unknown User', email: '' };
			} catch (error) {
				console.error('Error populating user for review:', review._id, error);
				review.user = { name: 'Unknown User', email: '' };
			}
			
			return review;
		}),

	// Create new review
	create: protectedProcedure
		.input(z.object({
			animeId: z.string(),
			animeTitle: z.string(),
			animeImage: z.string().optional(),
			title: z.string().min(1),
			content: z.string().min(10),
			rating: z.number().min(0).max(10),
			seasonNumber: z.number().optional(),
			episodeNumber: z.number().optional(),
		}))
		.handler(async ({ input, context }) => {
			const userId = context.session?.user?.id;
			
			// Check for duplicate review if episode is specified
			if (input.episodeNumber !== undefined) {
				const existingReview = await Review.findOne({
					user: userId,
					animeId: input.animeId,
					seasonNumber: input.seasonNumber,
					episodeNumber: input.episodeNumber,
				});
				
				if (existingReview) {
					throw new Error("You have already reviewed this episode");
				}
			}
			
			const review = await Review.create({
				...input,
				user: userId,
			});
			
			return review;
		}),

	// Update review
	update: protectedProcedure
		.input(z.object({
			id: z.string(),
			title: z.string().min(1).optional(),
			content: z.string().min(10).optional(),
			rating: z.number().min(0).max(10).optional(),
			seasonNumber: z.number().optional(),
			episodeNumber: z.number().optional(),
		}))
		.handler(async ({ input, context }) => {
			if (!mongoose.Types.ObjectId.isValid(input.id)) {
				throw new Error("Invalid review ID");
			}
			
			const { id, ...updateData } = input;
			const userId = context.session?.user?.id;
			
			const review = await Review.findOneAndUpdate(
				{ _id: id, user: userId },
				updateData,
				{ new: true, runValidators: true }
			);
			
			if (!review) {
				throw new Error("Review not found or unauthorized");
			}
			
			return review;
		}),

	// Delete review
	delete: protectedProcedure
		.input(z.object({
			id: z.string(),
		}))
		.handler(async ({ input, context }) => {
			if (!mongoose.Types.ObjectId.isValid(input.id)) {
				throw new Error("Invalid review ID");
			}
			
			const userId = context.session?.user?.id;
			
			const review = await Review.findOneAndDelete({
				_id: input.id,
				user: userId,
			});
			
			if (!review) {
				throw new Error("Review not found or unauthorized");
			}
			
			return { success: true };
		}),
};
