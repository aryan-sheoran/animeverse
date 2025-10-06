import { z } from "zod";
import { protectedProcedure, publicProcedure } from "../lib/orpc";
import { Show } from "../db/models/show.model";
import { HomeItem } from "../db/models/home-item.model";
import { SeasonRating } from "../db/models/season-rating.model";
import { Review } from "../db/models/review.model";
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
			includeRatings: z.boolean().optional().default(true),
		}))
		.handler(async ({ input }) => {
			const { limit, skip, search, genres, sortBy, includeRatings } = input;
			
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
				
				// Add average ratings to each show if requested
				if (includeRatings) {
					const showsWithRatings = await Promise.all(
						shows.map(async (show: any) => {
							try {
								// Get all season ratings for this show (0-5 scale)
								const seasonRatings = await SeasonRating.find({ show: show._id }).lean();
								
								// Get all reviews for this show (0-10 scale)
								const reviews = await Review.find({ animeId: show._id.toString() }).lean();
								
								// Normalize ratings to 0-5 scale
								const seasonRatingValues = seasonRatings.map(r => Number(r.rating || 0));
								const reviewRatingValues = reviews
									.map(r => {
										const val = Number(r.rating);
										// Convert 0-10 to 0-5 scale
										return Number.isFinite(val) ? Math.max(0, Math.min(5, val / 2)) : null;
									})
									.filter((v): v is number => v !== null && !Number.isNaN(v));
								
								// Combine all ratings
								const allRatings = [...seasonRatingValues, ...reviewRatingValues];
								
								if (allRatings.length === 0) {
									return { ...show, rating: 0, ratingCount: 0 };
								}
								
								// Calculate average
								const sum = allRatings.reduce((acc, rating) => acc + rating, 0);
								const average = sum / allRatings.length;
								
								return {
									...show,
									rating: Number(average.toFixed(2)), // 0-5 scale
									ratingCount: allRatings.length
								};
							} catch (error) {
								console.error(`Error calculating rating for show ${show._id}:`, error);
								return { ...show, rating: 0, ratingCount: 0 };
							}
						})
					);
					
					return showsWithRatings;
				}
				
				return shows;
			} catch (error) {
				console.error('❌ Router: Error fetching shows:', error);
				throw error;
			}
		}),

	// Get single show by ID
	getById: publicProcedure
		.input(z.object({
			id: z.string(),
			includeRatings: z.boolean().optional().default(true),
		}))
		.handler(async ({ input }) => {
			if (!mongoose.Types.ObjectId.isValid(input.id)) {
				throw new Error("Invalid show ID");
			}
			
			const show = await Show.findById(input.id).lean();
			
			if (!show) {
				throw new Error("Show not found");
			}
			
			// Increment view count
			await Show.findByIdAndUpdate(input.id, {
				$inc: { viewCount: 1 }
			});
			
			// Add ratings if requested
			if (input.includeRatings) {
				try {
					// Get all season ratings for this show (0-5 scale)
					const seasonRatings = await SeasonRating.find({ show: input.id }).lean();
					
					// Get all reviews for this show (0-10 scale)
					const reviews = await Review.find({ animeId: input.id }).lean();
					
					// Normalize ratings to 0-5 scale
					const seasonRatingValues = seasonRatings.map(r => Number(r.rating || 0));
					const reviewRatingValues = reviews
						.map(r => {
							const val = Number(r.rating);
							// Convert 0-10 to 0-5 scale
							return Number.isFinite(val) ? Math.max(0, Math.min(5, val / 2)) : null;
						})
						.filter((v): v is number => v !== null && !Number.isNaN(v));
					
					// Combine all ratings
					const allRatings = [...seasonRatingValues, ...reviewRatingValues];
					
					if (allRatings.length > 0) {
						const sum = allRatings.reduce((acc, rating) => acc + rating, 0);
						const average = sum / allRatings.length;
						
						return {
							...show,
							rating: Number(average.toFixed(2)), // 0-5 scale
							ratingCount: allRatings.length
						};
					}
					
					return { ...show, rating: 0, ratingCount: 0 };
				} catch (error) {
					console.error(`Error calculating rating for show ${input.id}:`, error);
					return { ...show, rating: 0, ratingCount: 0 };
				}
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
