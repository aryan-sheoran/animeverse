import { z } from "zod";
import { protectedProcedure, publicProcedure } from "../lib/orpc";
import { Review } from "../db/models/review.model";
import { Show } from "../db/models/show.model";
import mongoose from "mongoose";

export const reviewRouter = {
	// Get all reviews for a show
	getByShowId: publicProcedure
		.input(z.object({
			showId: z.string(),
			limit: z.number().optional().default(50),
			skip: z.number().optional().default(0),
		}))
		.handler(async ({ input }) => {
			if (!mongoose.Types.ObjectId.isValid(input.showId)) {
				throw new Error("Invalid show ID");
			}
			
			const reviews = await Review.find({ showId: input.showId })
				.sort({ createdAt: -1 })
				.limit(input.limit)
				.skip(input.skip)
				.populate('userId', 'name email')
				.lean();
			
			// Transform userId to user object
			const transformedReviews = reviews.map(review => ({
				...review,
				user: review.userId ? { username: (review.userId as any).name } : null,
			}));
			
			return transformedReviews;
		}),

	// Get user's own reviews
	getMyReviews: protectedProcedure
		.input(z.object({
			limit: z.number().optional().default(50),
			skip: z.number().optional().default(0),
		}))
		.handler(async ({ input, context }) => {
			const reviews = await Review.find({ userId: context.session?.user?.id })
				.sort({ createdAt: -1 })
				.limit(input.limit)
				.skip(input.skip)
				.populate('showId')
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
				.populate('userId', 'name email')
				.populate('showId')
				.lean();
			
			if (!review) {
				throw new Error("Review not found");
			}
			
			return review;
		}),

	// Create new review
	create: protectedProcedure
		.input(z.object({
			showId: z.string(),
			title: z.string().min(1),
			content: z.string().min(10),
			rating: z.number().min(0).max(10),
			bestMoment: z.string().optional(),
			worstMoment: z.string().optional(),
			seasonNumber: z.number().optional(),
			episodeNumber: z.number().optional(),
			isPublic: z.boolean().optional().default(true),
		}))
		.handler(async ({ input, context }) => {
			if (!mongoose.Types.ObjectId.isValid(input.showId)) {
				throw new Error("Invalid show ID");
			}
			
			const review = await Review.create({
				...input,
				userId: context.session?.user?.id,
			});
			
			// Update show's rating
			await updateShowRating(input.showId);
			
			return review;
		}),

	// Update review
	update: protectedProcedure
		.input(z.object({
			id: z.string(),
			title: z.string().min(1).optional(),
			content: z.string().min(10).optional(),
			rating: z.number().min(0).max(10).optional(),
			bestMoment: z.string().optional(),
			worstMoment: z.string().optional(),
			seasonNumber: z.number().optional(),
			episodeNumber: z.number().optional(),
			isPublic: z.boolean().optional(),
		}))
		.handler(async ({ input, context }) => {
			if (!mongoose.Types.ObjectId.isValid(input.id)) {
				throw new Error("Invalid review ID");
			}
			
			const { id, ...updateData } = input;
			
			const review = await Review.findOneAndUpdate(
				{ _id: id, userId: context.session?.user?.id },
				updateData,
				{ new: true, runValidators: true }
			);
			
			if (!review) {
				throw new Error("Review not found or unauthorized");
			}
			
			// Update show's rating
			await updateShowRating(review.showId.toString());
			
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
				userId: context.session?.user?.id,
			});
			
			if (!review) {
				throw new Error("Review not found or unauthorized");
			}
			
			// Update show's rating
			await updateShowRating(review.showId.toString());
			
			return { success: true };
		}),

	// Like review
	like: protectedProcedure
		.input(z.object({
			id: z.string(),
		}))
		.handler(async ({ input }) => {
			if (!mongoose.Types.ObjectId.isValid(input.id)) {
				throw new Error("Invalid review ID");
			}
			
			const review = await Review.findByIdAndUpdate(
				input.id,
				{ $inc: { likeCount: 1 } },
				{ new: true }
			);
			
			if (!review) {
				throw new Error("Review not found");
			}
			
			return review;
		}),

	// Increment view count
	incrementViewCount: publicProcedure
		.input(z.object({
			id: z.string(),
		}))
		.handler(async ({ input }) => {
			if (!mongoose.Types.ObjectId.isValid(input.id)) {
				throw new Error("Invalid review ID");
			}
			
			await Review.findByIdAndUpdate(input.id, {
				$inc: { viewCount: 1 }
			});
			
			return { success: true };
		}),
};

// Helper function to update show's average rating
async function updateShowRating(showId: string) {
	const reviews = await Review.find({ showId, isPublic: true }).lean();
	
	if (reviews.length === 0) {
		await Show.findByIdAndUpdate(showId, { rating: 0 });
		return;
	}
	
	const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
	const averageRating = totalRating / reviews.length / 2; // Convert 0-10 to 0-5
	
	await Show.findByIdAndUpdate(showId, { rating: averageRating });
}
