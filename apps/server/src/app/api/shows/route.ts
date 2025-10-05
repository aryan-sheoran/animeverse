import { NextRequest, NextResponse } from "next/server";
import "@/db"; // Ensure database connection is initialized
import { Show } from "@/db/models/show.model";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const limit = parseInt(searchParams.get('limit') || '50');
		const skip = parseInt(searchParams.get('skip') || '0');
		const search = searchParams.get('search') || '';
		const genres = searchParams.get('genres')?.split(',').filter(Boolean) || [];
		const sortBy = searchParams.get('sortBy') || 'recent';
		
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
