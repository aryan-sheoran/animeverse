import { NextRequest, NextResponse } from "next/server";
import { Review } from "@/db/models/review.model";
import mongoose from "mongoose";

export async function GET(
	request: NextRequest,
	{ params }: { params: { showId: string } }
) {
	try {
		const { showId } = params;
		
		if (!mongoose.Types.ObjectId.isValid(showId)) {
			return NextResponse.json(
				{ error: 'Invalid show ID' },
				{ status: 400 }
			);
		}
		
		const reviews = await Review.find({ showId, isPublic: true })
			.sort({ createdAt: -1 })
			.populate('userId', 'name email')
			.lean();
		
		// Transform userId to user object for frontend compatibility
		const transformedReviews = reviews.map(review => ({
			...review,
			user: review.userId ? { username: (review.userId as any).name } : null,
		}));
		
		return NextResponse.json(transformedReviews);
	} catch (error) {
		console.error('Error fetching reviews:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch reviews' },
			{ status: 500 }
		);
	}
}
