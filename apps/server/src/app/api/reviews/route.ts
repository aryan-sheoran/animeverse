import { NextRequest, NextResponse } from "next/server";
import "@/db"; // Ensure database connection is initialized
import { Review } from "@/db/models/review.model";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
	try {
		const session = await auth.api.getSession({
			headers: request.headers,
		});
		
		if (!session?.user) {
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 }
			);
		}
		
		const body = await request.json();
		
		// Validate required fields
		if (!body.animeId || !body.animeTitle || !body.title || !body.content || body.rating === undefined) {
			return NextResponse.json(
				{ error: 'Missing required fields' },
				{ status: 400 }
			);
		}
		
		// Check for duplicate review if episode is specified
		if (body.episodeNumber !== undefined) {
			const existingReview = await Review.findOne({
				user: session.user.id,
				animeId: body.animeId,
				seasonNumber: body.seasonNumber,
				episodeNumber: body.episodeNumber,
			});
			
			if (existingReview) {
				return NextResponse.json(
					{ error: 'You have already reviewed this episode' },
					{ status: 400 }
				);
			}
		}
		
		const review = await Review.create({
			...body,
			user: session.user.id,
		});
		
		return NextResponse.json(review, { status: 201 });
	} catch (error) {
		console.error('Error creating review:', error);
		return NextResponse.json(
			{ error: 'Failed to create review' },
			{ status: 500 }
		);
	}
}
