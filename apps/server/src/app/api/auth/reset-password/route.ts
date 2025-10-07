import { NextRequest, NextResponse } from "next/server";
import { client } from "@/db";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { email, username, newPassword } = body;

		if (!email || !username || !newPassword) {
			return NextResponse.json(
				{ message: "Email, username, and new password are required" },
				{ status: 400 }
			);
		}

		if (newPassword.length < 6) {
			return NextResponse.json(
				{ message: "Password must be at least 6 characters long" },
				{ status: 400 }
			);
		}

		// Get the users collection
		const usersCollection = client.collection("user");

		// Find user with matching email and username
		const user = await usersCollection.findOne({
			email: email.toLowerCase(),
			name: username,
		});

		if (!user) {
			return NextResponse.json(
				{ message: "Email and username do not match" },
				{ status: 404 }
			);
		}

		// Hash the new password using scrypt (same as Better Auth default)
		const salt = randomBytes(16).toString("hex");
		const buf = (await scryptAsync(newPassword, salt, 64)) as Buffer;
		const hashedPassword = `${buf.toString("hex")}.${salt}`;

		// Update the user's password
		await usersCollection.updateOne(
			{ _id: user._id },
			{ 
				$set: { 
					password: hashedPassword,
					updatedAt: new Date(),
				} 
			}
		);

		return NextResponse.json(
			{ message: "Password reset successfully" },
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error resetting password:", error);
		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 }
		);
	}
}
