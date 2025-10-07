import { NextRequest, NextResponse } from "next/server";
import { client } from "@/db";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { email, username } = body;

		if (!email || !username) {
			return NextResponse.json(
				{ message: "Email and username are required" },
				{ status: 400 }
			);
		}

		// Get the users collection
		const usersCollection = client.collection("user");

		// Find user with matching email and username (check both username and name fields)
		const user = await usersCollection.findOne({
			email: email.toLowerCase(),
			$or: [
				{ username: username },
				{ name: username }
			]
		});

		if (!user) {
			return NextResponse.json(
				{ message: "Email and username do not match" },
				{ status: 404 }
			);
		}

		// Identity verified successfully
		return NextResponse.json(
			{ message: "Identity verified successfully" },
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error verifying identity:", error);
		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 }
		);
	}
}
