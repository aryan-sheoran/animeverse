import { NextRequest, NextResponse } from "next/server";
import "@/db"; // Ensure database connection is initialized
import { SeasonRating } from "@/db/models/season-rating.model";
import { Review } from "@/db/models/review.model";
import mongoose from "mongoose";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ showId: string }> }
) {
	try {
		const { showId } = await params;
		
		if (!mongoose.Types.ObjectId.isValid(showId)) {
			return NextResponse.json(
				{ error: 'Invalid show ID' },
				{ status: 400 }
			);
		}
		
		// Get all season ratings for this show (0-5 scale)
		const seasonRatings = await SeasonRating.find({ show: showId }).lean();
		
		// Get all reviews for this show (0-10 scale, need to normalize)
		const reviews = await Review.find({ animeId: showId }).lean();
		
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
			return NextResponse.json({
				average: 0,
				count: 0,
				seasonRatingsCount: 0,
				reviewsCount: 0
			});
		}
		
		// Calculate average
		const sum = allRatings.reduce((acc, rating) => acc + rating, 0);
		const average = sum / allRatings.length;
		
		return NextResponse.json({
			average: Number(average.toFixed(2)), // 0-5 scale
			count: allRatings.length,
			seasonRatingsCount: seasonRatingValues.length,
			reviewsCount: reviewRatingValues.length
		});
	} catch (error) {
		console.error('Error calculating average rating:', error);
		return NextResponse.json(
			{ error: 'Failed to calculate average rating' },
			{ status: 500 }
		);
	}
}
