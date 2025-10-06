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
				
				// Debug: Check all reviews in the database
				const allReviews = await Review.find({}).limit(5).lean();
				console.log('🔍 Sample of all reviews in DB:', allReviews.length > 0 ? allReviews.map((r: any) => ({ _id: r._id, animeId: r.animeId, animeTitle: r.animeTitle })) : 'No reviews in database');
				
				// Fetch reviews without populate first to avoid type mismatch issues
				const reviews = await Review.find({ animeId: input.animeId })
					.sort({ createdAt: -1 })
					.limit(input.limit)
					.skip(input.skip)
					.lean();
				
				console.log('📋 Found reviews:', reviews.length);
				if (reviews.length > 0) {
					console.log('📋 First review user field:', reviews[0].user, 'Type:', typeof reviews[0].user);
				}
				
				// Manually populate user data to handle both ObjectId and String user IDs
				const reviewsWithUsers = await Promise.all(
					reviews.map(async (review: any) => {
						try {
							console.log('👤 Looking up user with ID:', review.user, 'Type:', typeof review.user);
							
							// Convert ObjectId to string if needed
							const userId = review.user.toString ? review.user.toString() : review.user;
							console.log('👤 Converted userId:', userId, 'Type:', typeof userId);
							
							// Use findOne with _id since User model has String _id
							const user = await User.findOne({ _id: userId }).select('name email').lean() as any;
							console.log('👤 Found user:', user ? (user as any).name : 'Not found');
							
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
				
				console.log('✅ Found reviews for animeId', input.animeId, ':', reviewsWithUsers.length);
				if (reviewsWithUsers.length > 0) {
					console.log('✅ First review sample:', JSON.stringify(reviewsWithUsers[0], null, 2));
				} else {
					console.log('⚠️ No reviews found. Checking if animeId exists in any review...');
					const anyReviewWithThisId = await Review.findOne({}).lean();
					if (anyReviewWithThisId) {
						console.log('⚠️ Sample review animeId format:', (anyReviewWithThisId as any).animeId, 'Type:', typeof (anyReviewWithThisId as any).animeId);
						console.log('⚠️ Requested animeId format:', input.animeId, 'Type:', typeof input.animeId);
					}
				}
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
			const reviews = await Review.find({ user: context.session?.user?.id })
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
			
			const review = await Review.findById(input.id)
				.populate('user', 'name email')
				.lean();
			
			if (!review) {
				throw new Error("Review not found");
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
			
			const review = await Review.findOneAndUpdate(
				{ _id: id, user: context.session?.user?.id },
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
			
			const review = await Review.findOneAndDelete({
				_id: input.id,
				user: context.session?.user?.id,
			});
			
			if (!review) {
				throw new Error("Review not found or unauthorized");
			}
			
			return { success: true };
		}),
};
