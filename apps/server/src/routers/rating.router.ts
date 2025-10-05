import { z } from "zod";
import { protectedProcedure, publicProcedure } from "../lib/orpc";
import { SeasonRating } from "../db/models/season-rating.model";
import mongoose from "mongoose";

export const ratingRouter = {
	// Get all ratings for a show
	getByShowId: publicProcedure
		.input(z.object({
			showId: z.string(),
			seasonNumber: z.number().optional(),
		}))
		.handler(async ({ input }) => {
			if (!mongoose.Types.ObjectId.isValid(input.showId)) {
				throw new Error("Invalid show ID");
			}
			
			const query: any = { show: input.showId };
			
			if (input.seasonNumber !== undefined) {
				query.seasonNumber = input.seasonNumber;
			}
			
			const ratings = await SeasonRating.find(query)
				.populate('user', 'name email')
				.sort({ createdAt: -1 })
				.lean();
			
			return ratings;
		}),

	// Get user's own ratings for a show
	getMyRatings: protectedProcedure
		.input(z.object({
			showId: z.string(),
		}))
		.handler(async ({ input, context }) => {
			if (!mongoose.Types.ObjectId.isValid(input.showId)) {
				throw new Error("Invalid show ID");
			}
			
			const ratings = await SeasonRating.find({
				user: context.session?.user?.id,
				show: input.showId,
			})
			.sort({ seasonNumber: 1 })
			.lean();
			
			return ratings;
		}),

	// Create or update season rating
	upsertRating: protectedProcedure
		.input(z.object({
			showId: z.string(),
			seasonNumber: z.number().min(1),
			seasonTitle: z.string(),
			rating: z.number().min(0).max(5),
			review: z.string().optional(),
			episodesWatched: z.number().optional(),
			totalEpisodes: z.number().optional(),
		}))
		.handler(async ({ input, context }) => {
			if (!mongoose.Types.ObjectId.isValid(input.showId)) {
				throw new Error("Invalid show ID");
			}
			
			const rating = await SeasonRating.findOneAndUpdate(
				{
					user: context.session?.user?.id,
					show: input.showId,
					seasonNumber: input.seasonNumber,
				},
				{
					seasonTitle: input.seasonTitle,
					rating: input.rating,
					review: input.review,
					episodesWatched: input.episodesWatched,
					totalEpisodes: input.totalEpisodes,
				},
				{
					upsert: true,
					new: true,
					runValidators: true,
				}
			);
			
			return rating;
		}),

	// Delete season rating
	deleteRating: protectedProcedure
		.input(z.object({
			showId: z.string(),
			seasonNumber: z.number(),
		}))
		.handler(async ({ input, context }) => {
			if (!mongoose.Types.ObjectId.isValid(input.showId)) {
				throw new Error("Invalid show ID");
			}
			
			const rating = await SeasonRating.findOneAndDelete({
				user: context.session?.user?.id,
				show: input.showId,
				seasonNumber: input.seasonNumber,
			});
			
			if (!rating) {
				throw new Error("Rating not found");
			}
			
			return { success: true };
		}),

	// Get average rating for a season
	getAverageRating: publicProcedure
		.input(z.object({
			showId: z.string(),
			seasonNumber: z.number(),
		}))
		.handler(async ({ input }) => {
			if (!mongoose.Types.ObjectId.isValid(input.showId)) {
				throw new Error("Invalid show ID");
			}
			
			const ratings = await SeasonRating.find({
				show: input.showId,
				seasonNumber: input.seasonNumber,
			}).lean();
			
			if (ratings.length === 0) {
				return { average: 0, count: 0 };
			}
			
			const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
			const average = sum / ratings.length;
			
			return {
				average: Number(average.toFixed(2)),
				count: ratings.length,
			};
		}),
};
