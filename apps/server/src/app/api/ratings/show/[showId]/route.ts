import { NextRequest, NextResponse } from "next/server";
import { SeasonRating } from "@/db/models/season-rating.model";
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
		
		const { searchParams } = new URL(request.url);
		const seasonNumber = searchParams.get('seasonNumber');
		
		const query: any = { showId };
		
		if (seasonNumber) {
			query.seasonNumber = parseInt(seasonNumber);
		}
		
		const ratings = await SeasonRating.find(query)
			.populate('userId', 'name email')
			.sort({ createdAt: -1 })
			.lean();
		
		return NextResponse.json(ratings);
	} catch (error) {
		console.error('Error fetching ratings:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch ratings' },
			{ status: 500 }
		);
	}
}
