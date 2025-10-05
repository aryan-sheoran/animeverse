import { NextRequest, NextResponse } from "next/server";
import "@/db"; // Ensure database connection is initialized
import { Review } from "@/db/models/review.model";
import mongoose from "mongoose";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ showId: string }> }
) {
	try {
		// In Next.js 15, params is a Promise
		const { showId } = await params;
		
		console.log('📥 Reviews API: Fetching reviews for showId:', showId);
		console.log('🔍 Query:', { animeId: showId });
		
		// Check if Review model is available
		if (!Review) {
			console.error('❌ Review model not found');
			return NextResponse.json(
				{ error: 'Review model not initialized' },
				{ status: 500 }
			);
		}
		
		// First try without populate to isolate the issue
		let reviews;
		try {
			reviews = await Review.find({ animeId: showId })
				.sort({ createdAt: -1 })
				.lean();
			
			console.log('✅ Reviews API: Found', reviews.length, 'reviews (without populate)');
			
			// Try to populate user separately
			if (reviews.length > 0) {
				try {
					reviews = await Review.find({ animeId: showId })
						.sort({ createdAt: -1 })
						.populate('user', 'name email')
						.lean();
					console.log('✅ Successfully populated user data');
				} catch (populateError) {
					console.warn('⚠️ Failed to populate user, returning reviews without user data:', populateError);
					// Return reviews without user data if populate fails
				}
			}
		} catch (queryError) {
			console.error('❌ Query error:', queryError);
			throw queryError;
		}
		
		return NextResponse.json(reviews || []);
	} catch (error) {
		console.error('❌ Error fetching reviews:', error);
		console.error('Stack:', error instanceof Error ? error.stack : 'No stack trace');
		return NextResponse.json(
			{ error: 'Failed to fetch reviews', details: error instanceof Error ? error.message : String(error) },
			{ status: 500 }
		);
	}
}
