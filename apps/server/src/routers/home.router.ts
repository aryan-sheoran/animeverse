import { z } from "zod";
import { protectedProcedure, publicProcedure } from "../lib/orpc";
import { HomeItem } from "../db/models/home-item.model";
import mongoose from "mongoose";

export const homeRouter = {
	// Get all home items for a section
	getBySection: publicProcedure
		.input(z.object({
			section: z.enum(['hero', 'featured', 'popular', 'trending']),
			limit: z.number().optional().default(10),
		}))
		.handler(async ({ input }) => {
			const now = new Date();
			
			const homeItems = await HomeItem.find({
				section: input.section,
				isActive: true,
				$or: [
					{ startDate: { $lte: now }, endDate: { $gte: now } },
					{ startDate: { $exists: false }, endDate: { $exists: false } },
					{ startDate: { $lte: now }, endDate: { $exists: false } },
					{ startDate: { $exists: false }, endDate: { $gte: now } },
				]
			})
			.populate('show')
			.sort({ order: 1 })
			.limit(input.limit)
			.lean();
			
			return homeItems;
		}),

	// Get all active home items
	getAll: publicProcedure
		.handler(async () => {
			const now = new Date();
			
			const homeItems = await HomeItem.find({
				isActive: true,
				$or: [
					{ startDate: { $lte: now }, endDate: { $gte: now } },
					{ startDate: { $exists: false }, endDate: { $exists: false } },
					{ startDate: { $lte: now }, endDate: { $exists: false } },
					{ startDate: { $exists: false }, endDate: { $gte: now } },
				]
			})
			.populate('show')
			.sort({ section: 1, order: 1 })
			.lean();
			
			// Group by section
			const grouped = homeItems.reduce((acc, item) => {
				if (!acc[item.section]) {
					acc[item.section] = [];
				}
				acc[item.section].push(item);
				return acc;
			}, {} as Record<string, any[]>);
			
			return grouped;
		}),

	// Create home item (protected - admin only)
	create: protectedProcedure
		.input(z.object({
			showId: z.string(),
			section: z.enum(['hero', 'featured', 'popular', 'trending']),
			order: z.number().optional().default(0),
			isActive: z.boolean().optional().default(true),
			startDate: z.string().optional(),
			endDate: z.string().optional(),
		}))
		.handler(async ({ input }) => {
			if (!mongoose.Types.ObjectId.isValid(input.showId)) {
				throw new Error("Invalid show ID");
			}
			
			const homeItem = await HomeItem.create({
				show: input.showId,
				section: input.section,
				order: input.order,
				isActive: input.isActive,
				startDate: input.startDate ? new Date(input.startDate) : undefined,
				endDate: input.endDate ? new Date(input.endDate) : undefined,
			});
			
			return homeItem;
		}),

	// Update home item (protected - admin only)
	update: protectedProcedure
		.input(z.object({
			id: z.string(),
			showId: z.string().optional(),
			section: z.enum(['hero', 'featured', 'popular', 'trending']).optional(),
			order: z.number().optional(),
			isActive: z.boolean().optional(),
			startDate: z.string().optional(),
			endDate: z.string().optional(),
		}))
		.handler(async ({ input }) => {
			if (!mongoose.Types.ObjectId.isValid(input.id)) {
				throw new Error("Invalid home item ID");
			}
			
			const { id, showId, startDate, endDate, ...updateData } = input;
			
			const updates: any = updateData;
			
			if (showId) {
				if (!mongoose.Types.ObjectId.isValid(showId)) {
					throw new Error("Invalid show ID");
				}
				updates.show = showId;
			}
			
			if (startDate) updates.startDate = new Date(startDate);
			if (endDate) updates.endDate = new Date(endDate);
			
			const homeItem = await HomeItem.findByIdAndUpdate(
				id,
				updates,
				{ new: true, runValidators: true }
			);
			
			if (!homeItem) {
				throw new Error("Home item not found");
			}
			
			return homeItem;
		}),

	// Delete home item (protected - admin only)
	delete: protectedProcedure
		.input(z.object({
			id: z.string(),
		}))
		.handler(async ({ input }) => {
			if (!mongoose.Types.ObjectId.isValid(input.id)) {
				throw new Error("Invalid home item ID");
			}
			
			const homeItem = await HomeItem.findByIdAndDelete(input.id);
			
			if (!homeItem) {
				throw new Error("Home item not found");
			}
			
			return { success: true };
		}),
};
