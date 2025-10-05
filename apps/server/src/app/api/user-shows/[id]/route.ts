import { NextRequest, NextResponse } from "next/server";
import "@/db"; // Ensure database connection is initialized
import { UserShow } from "@/db/models/user-show.model";
import { auth } from "@/lib/auth";
import mongoose from "mongoose";

interface RouteParams {
	params: {
		id: string;
	};
}

// DELETE - Remove a user show
export async function DELETE(
	request: NextRequest,
	{ params }: RouteParams
) {
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

		const { id } = params;

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return NextResponse.json(
				{ error: 'Invalid ID' },
				{ status: 400 }
			);
		}

		const userShow = await UserShow.findOneAndDelete({
			_id: id,
			userId: session.user.id,
		});

		if (!userShow) {
			return NextResponse.json(
				{ error: 'Show not found in your list' },
				{ status: 404 }
			);
		}

		return NextResponse.json({ success: true, message: 'Show deleted successfully' });
	} catch (error) {
		console.error('Error deleting user show:', error);
		return NextResponse.json(
			{ error: 'Failed to delete user show' },
			{ status: 500 }
		);
	}
}

// PATCH - Update a user show (e.g., toggle favorite, update progress)
export async function PATCH(
	request: NextRequest,
	{ params }: RouteParams
) {
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

		const { id } = params;

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return NextResponse.json(
				{ error: 'Invalid ID' },
				{ status: 400 }
			);
		}

		const body = await request.json();

		// Update the user show with the provided fields
		const updateData: any = {
			...body,
			lastWatchedAt: new Date(),
		};

		const userShow = await UserShow.findOneAndUpdate(
			{
				_id: id,
				userId: session.user.id,
			},
			updateData,
			{ 
				new: true, 
				runValidators: true 
			}
		).populate('showId');

		if (!userShow) {
			return NextResponse.json(
				{ error: 'Show not found in your list' },
				{ status: 404 }
			);
		}

		return NextResponse.json(userShow);
	} catch (error) {
		console.error('Error updating user show:', error);
		return NextResponse.json(
			{ error: 'Failed to update user show' },
			{ status: 500 }
		);
	}
}

// GET - Get a specific user show
export async function GET(
	request: NextRequest,
	{ params }: RouteParams
) {
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

		const { id } = params;

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return NextResponse.json(
				{ error: 'Invalid ID' },
				{ status: 400 }
			);
		}

		const userShow = await UserShow.findOne({
			_id: id,
			userId: session.user.id,
		}).populate('showId');

		if (!userShow) {
			return NextResponse.json(
				{ error: 'Show not found in your list' },
				{ status: 404 }
			);
		}

		return NextResponse.json(userShow);
	} catch (error) {
		console.error('Error fetching user show:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch user show' },
			{ status: 500 }
		);
	}
}
