import { z } from "zod";
import { protectedProcedure, publicProcedure } from "../lib/orpc";
import { Show } from "../db/models/show.model";
import { HomeItem } from "../db/models/home-item.model";
import mongoose from "mongoose";

export const showRouter = {
	// Get all shows (public)
	getAll: publicProcedure
		.input(z.object({
			limit: z.number().optional().default(50),
			skip: z.number().optional().default(0),
			search: z.string().optional(),
			genres: z.array(z.string()).optional(),
			sortBy: z.enum(['rating', 'recent', 'title']).optional().default('recent'),
		}))
		.handler(async ({ input }) => {
			const { limit, skip, search, genres, sortBy } = input;
			
			const query: any = {};
			
			if (search) {
				query.$or = [
					{ title: { $regex: search, $options: 'i' } },
					{ description: { $regex: search, $options: 'i' } }
				];
			}
			
			if (genres && genres.length > 0) {
				query.genres = { $in: genres };
			}
			
		const sort: any = {};
		if (sortBy === 'rating') sort.rating = -1;
		else if (sortBy === 'title') sort.title = 1;
		else sort.createdAt = -1;
		
		try {
			const shows = await Show.find(query)
				.sort(sort)
				.limit(limit)
				.skip(skip)
				.lean();
			
			console.log(`✅ Router: Found ${shows.length} shows in database`);
			return shows;
		} catch (error) {
			console.error('❌ Router: Error fetching shows:', error);
			throw error;
		}
	}),	// Get single show by ID
	getById: publicProcedure
		.input(z.object({
			id: z.string(),
		}))
		.handler(async ({ input }) => {
			if (!mongoose.Types.ObjectId.isValid(input.id)) {
				throw new Error("Invalid show ID");
			}
			
			const show = await Show.findById(input.id).lean();
			
			if (!show) {
				throw new Error("Show not found");
			}
			
			return show;
		}),

	// Create new show (protected)
	create: protectedProcedure
		.input(z.object({
			title: z.string().min(1),
			description: z.string().optional(),
			coverImageUrl: z.string().optional(),
			imageUrl: z.string().optional(),
			cardImage: z.string().optional(),
			genres: z.array(z.string()).optional(),
			seasons: z.array(z.object({
				seasonNumber: z.number(),
				title: z.string(),
				episodes: z.number(),
				status: z.enum(['Ongoing', 'Finished', 'Upcoming']).optional(),
				releaseDate: z.string().optional(),
				description: z.string().optional(),
			})).optional(),
			totalEpisodes: z.number().optional(),
			status: z.enum(['Ongoing', 'Completed', 'Upcoming', 'Hiatus']).optional(),
			releaseYear: z.number().optional(),
			studio: z.string().optional(),
			director: z.string().optional(),
			tags: z.array(z.string()).optional(),
			isFeatured: z.boolean().optional(),
			isPopular: z.boolean().optional(),
		}))
		.handler(async ({ input, context }) => {
			const show = await Show.create({
				...input,
				createdBy: context.session?.user?.id,
			});
			
			return show;
		}),

	// Update show (protected)
	update: protectedProcedure
		.input(z.object({
			id: z.string(),
			title: z.string().min(1).optional(),
			description: z.string().optional(),
			coverImageUrl: z.string().optional(),
			imageUrl: z.string().optional(),
			cardImage: z.string().optional(),
			genres: z.array(z.string()).optional(),
			seasons: z.array(z.object({
				seasonNumber: z.number(),
				title: z.string(),
				episodes: z.number(),
				status: z.enum(['Ongoing', 'Finished', 'Upcoming']).optional(),
				releaseDate: z.string().optional(),
				description: z.string().optional(),
			})).optional(),
			totalEpisodes: z.number().optional(),
			status: z.enum(['Ongoing', 'Completed', 'Upcoming', 'Hiatus']).optional(),
			releaseYear: z.number().optional(),
			studio: z.string().optional(),
			director: z.string().optional(),
			tags: z.array(z.string()).optional(),
			isFeatured: z.boolean().optional(),
			isPopular: z.boolean().optional(),
		}))
		.handler(async ({ input }) => {
			if (!mongoose.Types.ObjectId.isValid(input.id)) {
				throw new Error("Invalid show ID");
			}
			
			const { id, ...updateData } = input;
			
			const show = await Show.findByIdAndUpdate(
				id,
				updateData,
				{ new: true, runValidators: true }
			);
			
			if (!show) {
				throw new Error("Show not found");
			}
			
			return show;
		}),

	// Delete show (protected)
	delete: protectedProcedure
		.input(z.object({
			id: z.string(),
		}))
		.handler(async ({ input }) => {
			if (!mongoose.Types.ObjectId.isValid(input.id)) {
				throw new Error("Invalid show ID");
			}
			
			const show = await Show.findByIdAndDelete(input.id);
			
			if (!show) {
				throw new Error("Show not found");
			}
			
			return { success: true };
		}),

	// Increment view count
	incrementViewCount: publicProcedure
		.input(z.object({
			id: z.string(),
		}))
		.handler(async ({ input }) => {
			if (!mongoose.Types.ObjectId.isValid(input.id)) {
				throw new Error("Invalid show ID");
			}
			
			await Show.findByIdAndUpdate(input.id, {
				$inc: { viewCount: 1 }
			});
			
			return { success: true };
		}),
};
