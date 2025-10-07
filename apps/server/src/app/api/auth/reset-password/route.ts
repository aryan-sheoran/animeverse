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

		// Get the users and accounts collections
		const usersCollection = client.collection("user");
		const accountsCollection = client.collection("account");

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

		// Hash the new password using scrypt (same as Better Auth default)
		const salt = randomBytes(16).toString("hex");
		const buf = (await scryptAsync(newPassword, salt, 64)) as Buffer;
		const hashedPassword = `${buf.toString("hex")}.${salt}`;

		// Update the password in the account table (where Better Auth stores passwords)
		console.log(`Updating password for user ${user._id} with email ${email}`);
		const accountUpdateResult = await accountsCollection.updateOne(
			{ 
				userId: user._id,
				providerId: "credential" // Better Auth uses 'credential' as providerId for email/password
			},
			{ 
				$set: { 
					password: hashedPassword,
					updatedAt: new Date(),
				} 
			}
		);

		// Also update the user's updatedAt timestamp
		await usersCollection.updateOne(
			{ _id: user._id },
			{ $set: { updatedAt: new Date() } }
		);

		if (accountUpdateResult.matchedCount === 0) {
			console.error(`Account not found for user ${user._id} with providerId 'credential'`);
			return NextResponse.json(
				{ message: "Account not found or not using email/password authentication" },
				{ status: 404 }
			);
		}

		console.log(`Password reset successfully for user ${user._id}`);
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
