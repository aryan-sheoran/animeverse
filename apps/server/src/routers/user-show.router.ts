import { z } from "zod";
import { protectedProcedure } from "../lib/orpc";
import { UserShow } from "../db/models/user-show.model";
import mongoose from "mongoose";

export const userShowRouter = {
	// Get all user shows
	getMyShows: protectedProcedure
		.input(z.object({
			status: z.enum(['watching', 'completed', 'plan-to-watch', 'on-hold', 'dropped']).optional(),
			isFavorite: z.boolean().optional(),
			limit: z.number().optional().default(50),
			skip: z.number().optional().default(0),
		}))
		.handler(async ({ input, context }) => {
			const query: any = { userId: context.session?.user?.id };
			
			if (input.status) {
				query.status = input.status;
			}
			
			if (input.isFavorite !== undefined) {
				query.isFavorite = input.isFavorite;
			}
			
			const userShows = await UserShow.find(query)
				.populate('showId')
				.sort({ lastWatchedAt: -1 })
				.limit(input.limit)
				.skip(input.skip)
				.lean();
			
			return userShows;
		}),

	// Get single user show
	getUserShow: protectedProcedure
		.input(z.object({
			showId: z.string(),
		}))
		.handler(async ({ input, context }) => {
			if (!mongoose.Types.ObjectId.isValid(input.showId)) {
				throw new Error("Invalid show ID");
			}
			
			const userShow = await UserShow.findOne({
				userId: context.session?.user?.id,
				showId: input.showId,
			})
			.populate('showId')
			.lean();
			
			return userShow;
		}),

	// Add show to user's list
	addShow: protectedProcedure
		.input(z.object({
			showId: z.string(),
			status: z.enum(['watching', 'completed', 'plan-to-watch', 'on-hold', 'dropped']).optional().default('watching'),
			isFavorite: z.boolean().optional().default(false),
			currentEpisode: z.number().optional().default(0),
			currentSeason: z.number().optional().default(1),
			personalRating: z.number().min(0).max(10).optional(),
			notes: z.string().optional(),
		}))
		.handler(async ({ input, context }) => {
			if (!mongoose.Types.ObjectId.isValid(input.showId)) {
				throw new Error("Invalid show ID");
			}
			
			// Check if already exists
			const existing = await UserShow.findOne({
				userId: context.session?.user?.id,
				showId: input.showId,
			});
			
			if (existing) {
				throw new Error("Show already in your list");
			}
			
			const userShow = await UserShow.create({
				...input,
				userId: context.session?.user?.id,
				startedAt: new Date(),
			});
			
			return userShow;
		}),

	// Update user show
	updateShow: protectedProcedure
		.input(z.object({
			showId: z.string(),
			status: z.enum(['watching', 'completed', 'plan-to-watch', 'on-hold', 'dropped']).optional(),
			isFavorite: z.boolean().optional(),
			currentEpisode: z.number().optional(),
			currentSeason: z.number().optional(),
			personalRating: z.number().min(0).max(10).optional(),
			notes: z.string().optional(),
		}))
		.handler(async ({ input, context }) => {
			if (!mongoose.Types.ObjectId.isValid(input.showId)) {
				throw new Error("Invalid show ID");
			}
			
			const { showId, ...updateData } = input;
			
			const updates: any = {
				...updateData,
				lastWatchedAt: new Date(),
			};
			
			// If status is completed, set completedAt
			if (updateData.status === 'completed') {
				updates.completedAt = new Date();
			}
			
			const userShow = await UserShow.findOneAndUpdate(
				{
					userId: context.session?.user?.id,
					showId,
				},
				updates,
				{ new: true, runValidators: true }
			);
			
			if (!userShow) {
				throw new Error("Show not found in your list");
			}
			
			return userShow;
		}),

	// Remove show from user's list
	removeShow: protectedProcedure
		.input(z.object({
			showId: z.string(),
		}))
		.handler(async ({ input, context }) => {
			if (!mongoose.Types.ObjectId.isValid(input.showId)) {
				throw new Error("Invalid show ID");
			}
			
			const userShow = await UserShow.findOneAndDelete({
				userId: context.session?.user?.id,
				showId: input.showId,
			});
			
			if (!userShow) {
				throw new Error("Show not found in your list");
			}
			
			return { success: true };
		}),

	// Toggle favorite
	toggleFavorite: protectedProcedure
		.input(z.object({
			showId: z.string(),
		}))
		.handler(async ({ input, context }) => {
			if (!mongoose.Types.ObjectId.isValid(input.showId)) {
				throw new Error("Invalid show ID");
			}
			
			const userShow = await UserShow.findOne({
				userId: context.session?.user?.id,
				showId: input.showId,
			});
			
			if (!userShow) {
				throw new Error("Show not found in your list");
			}
			
			userShow.isFavorite = !userShow.isFavorite;
			await userShow.save();
			
			return userShow;
		}),
};
