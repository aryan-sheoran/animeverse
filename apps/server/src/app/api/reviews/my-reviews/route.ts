import { NextRequest, NextResponse } from "next/server";
import { Review } from "@/db/models/review.model";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
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
		
		const reviews = await Review.find({ userId: session.user.id })
			.sort({ createdAt: -1 })
			.populate('showId')
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
		
		const review = await Review.create({
			...body,
			userId: session.user.id,
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
