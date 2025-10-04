import { NextRequest, NextResponse } from "next/server";
import { UserShow } from "@/db/models/user-show.model";
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
		
		const { searchParams } = new URL(request.url);
		const status = searchParams.get('status');
		const isFavorite = searchParams.get('isFavorite');
		
		const query: any = { userId: session.user.id };
		
		if (status) {
			query.status = status;
		}
		
		if (isFavorite !== null) {
			query.isFavorite = isFavorite === 'true';
		}
		
		const userShows = await UserShow.find(query)
			.populate('showId')
			.sort({ lastWatchedAt: -1 })
			.lean();
		
		return NextResponse.json(userShows);
	} catch (error) {
		console.error('Error fetching user shows:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch user shows' },
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
		
		// Check if already exists
		const existing = await UserShow.findOne({
			userId: session.user.id,
			showId: body.showId,
		});
		
		if (existing) {
			return NextResponse.json(
				{ error: 'Show already in your list' },
				{ status: 400 }
			);
		}
		
		const userShow = await UserShow.create({
			...body,
			userId: session.user.id,
			startedAt: new Date(),
		});
		
		return NextResponse.json(userShow, { status: 201 });
	} catch (error) {
		console.error('Error creating user show:', error);
		return NextResponse.json(
			{ error: 'Failed to create user show' },
			{ status: 500 }
		);
	}
}
