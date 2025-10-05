import { NextRequest, NextResponse } from "next/server";
import "@/db"; // Ensure database connection is initialized
import { HomeItem } from "@/db/models/home-item.model";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const section = searchParams.get('section');
		
		const now = new Date();
		const query: any = {
			isActive: true,
			$or: [
				{ startDate: { $lte: now }, endDate: { $gte: now } },
				{ startDate: { $exists: false }, endDate: { $exists: false } },
				{ startDate: { $lte: now }, endDate: { $exists: false } },
				{ startDate: { $exists: false }, endDate: { $gte: now } },
			]
		};
		
		if (section) {
			query.section = section;
		}
		
		const homeItems = await HomeItem.find(query)
			.populate('show')
			.sort({ section: 1, order: 1 })
			.lean();
		
		if (section) {
			return NextResponse.json(homeItems);
		}
		
		// Group by section
		const grouped = homeItems.reduce((acc, item) => {
			if (!acc[item.section]) {
				acc[item.section] = [];
			}
			acc[item.section].push(item);
			return acc;
		}, {} as Record<string, any[]>);
		
		return NextResponse.json(grouped);
	} catch (error) {
		console.error('Error fetching home items:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch home items' },
			{ status: 500 }
		);
	}
}
