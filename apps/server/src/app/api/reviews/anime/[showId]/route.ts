import { NextRequest, NextResponse } from "next/server";
import "@/db"; // Ensure database connection is initialized
import { Review } from "@/db/models/review.model";
import mongoose from "mongoose";

export async function GET(
	request: NextRequest,
	{ params }: { params: { showId: string } }
) {
	try {
		const { showId } = params;
		
		// animeId is a string, not an ObjectId
		const reviews = await Review.find({ animeId: showId })
			.sort({ createdAt: -1 })
			.populate('user', 'name email')
			.lean();
		
		return NextResponse.json(reviews);
	} catch (error) {
		console.error('Error fetching reviews:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch reviews' },
			{ status: 500 }
		);
	}
}
