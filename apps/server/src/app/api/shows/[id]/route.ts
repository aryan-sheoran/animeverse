import { NextRequest, NextResponse } from "next/server";
import "@/db"; // Ensure database connection is initialized
import { Show } from "@/db/models/show.model";
import mongoose from "mongoose";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		
		if (!mongoose.Types.ObjectId.isValid(id)) {
			return NextResponse.json(
				{ error: 'Invalid show ID' },
				{ status: 400 }
			);
		}
		
		const show = await Show.findById(id).lean();
		
		if (!show) {
			return NextResponse.json(
				{ error: 'Show not found' },
				{ status: 404 }
			);
		}
		
		// Increment view count
		await Show.findByIdAndUpdate(id, {
			$inc: { viewCount: 1 }
		});
		
		return NextResponse.json(show);
	} catch (error) {
		console.error('Error fetching show:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch show' },
			{ status: 500 }
		);
	}
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const body = await request.json();
		
		if (!mongoose.Types.ObjectId.isValid(id)) {
			return NextResponse.json(
				{ error: 'Invalid show ID' },
				{ status: 400 }
			);
		}
		
		const show = await Show.findByIdAndUpdate(
			id,
			body,
			{ new: true, runValidators: true }
		);
		
		if (!show) {
			return NextResponse.json(
				{ error: 'Show not found' },
				{ status: 404 }
			);
		}
		
		return NextResponse.json(show);
	} catch (error) {
		console.error('Error updating show:', error);
		return NextResponse.json(
			{ error: 'Failed to update show' },
			{ status: 500 }
		);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		
		if (!mongoose.Types.ObjectId.isValid(id)) {
			return NextResponse.json(
				{ error: 'Invalid show ID' },
				{ status: 400 }
			);
		}
		
		const show = await Show.findByIdAndDelete(id);
		
		if (!show) {
			return NextResponse.json(
				{ error: 'Show not found' },
				{ status: 404 }
			);
		}
		
		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error deleting show:', error);
		return NextResponse.json(
			{ error: 'Failed to delete show' },
			{ status: 500 }
		);
	}
}
