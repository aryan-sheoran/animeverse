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
				
				// Manually populate user data
				const reviewsWithUsers = await Promise.all(
					reviews.map(async (review: any) => {
						try {
							// Handle both ObjectId and String user IDs
							// For old reviews: user is ObjectId, for new reviews: user is String
							let userId = review.user;
							
							// If it's an ObjectId, convert to string
							if (userId && typeof userId === 'object' && userId.toString) {
								userId = userId.toString();
							}
							
							console.log('👤 Looking up user with ID:', userId, 'Type:', typeof userId);
							
							// Try to find user by their string _id
							const user = await User.findOne({ _id: userId }).select('name email').lean() as any;
							console.log('👤 Found user:', user ? (user as any).name : 'Not found');
							
							// If not found, let's check what users actually exist (only once)
							if (!user && reviews.indexOf(review) === 0) {
								const sampleUsers = await User.find({}).limit(3).select('_id name').lean();
								console.log('👥 Sample users in database:', sampleUsers.map((u: any) => ({ _id: u._id, name: u.name })));
								console.log('👥 Trying to match userId:', userId, 'Length:', userId ? userId.length : 0);
							}
							
							return {
								...review,
								user: user || { name: 'Unknown User', email: '' }
							};
						} catch (error) {
							console.error('Error populating user for review:', review._id, error);
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
