import { NextRequest, NextResponse } from "next/server";
import "@/db"; // Ensure database connection is initialized
import { Show } from "@/db/models/show.model";
import { SeasonRating } from "@/db/models/season-rating.model";
import { Review } from "@/db/models/review.model";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const limit = parseInt(searchParams.get('limit') || '50');
		const skip = parseInt(searchParams.get('skip') || '0');
		const search = searchParams.get('search') || '';
		const genres = searchParams.get('genres')?.split(',').filter(Boolean) || [];
		const sortBy = searchParams.get('sortBy') || 'recent';
		const includeRatings = searchParams.get('includeRatings') !== 'false'; // Default to true
		
		const query: any = {};
		
		if (search) {
			query.$or = [
				{ title: { $regex: search, $options: 'i' } },
				{ description: { $regex: search, $options: 'i' } }
			];
		}
		
		if (genres.length > 0) {
			query.genres = { $in: genres };
		}
		
		const sort: any = {};
		if (sortBy === 'title') sort.title = 1;
		else sort.createdAt = -1;
		
		const shows = await Show.find(query)
			.sort(sort)
			.limit(limit)
			.skip(skip)
			.lean();
		
		console.log(`API: Found ${shows.length} shows in database`);
		
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
			
			return NextResponse.json(showsWithRatings);
		}
		
		return NextResponse.json(shows);
	} catch (error) {
		console.error('Error fetching shows:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch shows' },
			{ status: 500 }
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		
		const show = await Show.create(body);
		
		return NextResponse.json(show, { status: 201 });
	} catch (error) {
		console.error('Error creating show:', error);
		return NextResponse.json(
			{ error: 'Failed to create show' },
			{ status: 500 }
		);
	}
}
