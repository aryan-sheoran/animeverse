import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/db";
import { User } from "@/db/models/auth.model";
import { Review } from "@/db/models/review.model";
import mongoose from "mongoose";

/**
 * DEBUG ENDPOINT: Check ID formats in database
 * GET /api/debug/id-check
 * 
 * This endpoint helps identify the ID format mismatch causing "Unknown User" issues
 */
export async function GET(request: NextRequest) {
	try {
		await connectDB();

		// Get sample users
		const users = await User.find({}).limit(5).select('_id name email').lean();
		
		// Get sample reviews
		const reviews = await Review.find({}).limit(5).select('_id user animeTitle').lean();

		// Analysis
		const analysis = {
			timestamp: new Date().toISOString(),
			database: mongoose.connection.name,
			
			users: {
				count: await User.countDocuments(),
				samples: users.map((u: any) => ({
					_id: u._id,
					_id_type: typeof u._id,
					_id_constructor: u._id?.constructor?.name,
					_id_length: String(u._id)?.length,
					_id_string: String(u._id),
					name: u.name,
					email: u.email,
				})),
			},
			
			reviews: {
				count: await Review.countDocuments(),
				samples: reviews.map((r: any) => ({
					_id: r._id,
					_id_type: typeof r._id,
					_id_constructor: r._id?.constructor?.name,
					_id_string: String(r._id),
					user: r.user,
					user_type: typeof r.user,
					user_constructor: r.user?.constructor?.name,
					user_length: String(r.user)?.length,
					user_string: String(r.user),
					animeTitle: r.animeTitle,
				})),
			},

			// Cross-reference check
			crossCheck: await (async () => {
				if (reviews.length === 0) return { message: 'No reviews to check' };
				
				const firstReview = reviews[0] as any;
				const userId = firstReview.user;
				
				// Try different lookup methods
				const lookups = {
					original: {
						userId: userId,
						method: 'User.findOne({ _id: userId })',
						result: null as any,
					},
					stringified: {
						userId: String(userId),
						method: 'User.findOne({ _id: String(userId) })',
						result: null as any,
					},
					trimmed: {
						userId: String(userId).trim(),
						method: 'User.findOne({ _id: String(userId).trim() })',
						result: null as any,
					},
				};

				// Try original
				try {
					const user = await User.findOne({ _id: userId }).select('_id name').lean();
					lookups.original.result = user ? { found: true, name: (user as any).name } : { found: false };
				} catch (err: any) {
					lookups.original.result = { error: err.message };
				}

				// Try stringified
				try {
					const user = await User.findOne({ _id: String(userId) }).select('_id name').lean();
					lookups.stringified.result = user ? { found: true, name: (user as any).name } : { found: false };
				} catch (err: any) {
					lookups.stringified.result = { error: err.message };
				}

				// Try trimmed
				try {
					const user = await User.findOne({ _id: String(userId).trim() }).select('_id name').lean();
					lookups.trimmed.result = user ? { found: true, name: (user as any).name } : { found: false };
				} catch (err: any) {
					lookups.trimmed.result = { error: err.message };
				}

				return lookups;
			})(),

			// Check if any user IDs match review user fields
			matchCheck: await (async () => {
				if (users.length === 0 || reviews.length === 0) {
					return { message: 'Not enough data to check matches' };
				}

				const userIds = users.map((u: any) => String(u._id));
				const reviewUserIds = reviews.map((r: any) => String(r.user));

				return {
					userIds: userIds,
					reviewUserIds: reviewUserIds,
					exactMatches: reviewUserIds.filter((ruid: string) => userIds.includes(ruid)),
					trimmedMatches: reviewUserIds.filter((ruid: string) => 
						userIds.some((uid: string) => uid.trim() === ruid.trim())
					),
					caseInsensitiveMatches: reviewUserIds.filter((ruid: string) => 
						userIds.some((uid: string) => uid.toLowerCase() === ruid.toLowerCase())
					),
				};
			})(),

			recommendations: [] as string[],
		};

		// Add recommendations based on findings
		if (analysis.users.samples.length > 0) {
			const userIdType = analysis.users.samples[0]._id_constructor;
			analysis.recommendations.push(`User IDs are stored as: ${userIdType}`);
		}

		if (analysis.reviews.samples.length > 0) {
			const reviewIdType = analysis.reviews.samples[0]._id_constructor;
			const reviewUserType = analysis.reviews.samples[0].user_constructor;
			analysis.recommendations.push(`Review IDs are stored as: ${reviewIdType}`);
			analysis.recommendations.push(`Review.user references are stored as: ${reviewUserType}`);
		}

		// Check for mismatches
		if (analysis.crossCheck && typeof analysis.crossCheck === 'object' && 'original' in analysis.crossCheck) {
			const anySuccess = Object.values(analysis.crossCheck).some(
				(lookup: any) => lookup.result?.found === true
			);
			
			if (!anySuccess) {
				analysis.recommendations.push('⚠️ CRITICAL: No user lookup methods succeeded! User ID format mismatch detected.');
			} else {
				const successfulMethod = Object.entries(analysis.crossCheck).find(
					([_, lookup]) => (lookup as any).result?.found === true
				);
				if (successfulMethod) {
					analysis.recommendations.push(`✅ User lookup succeeds with: ${successfulMethod[0]} method`);
				}
			}
		}

		// Check match results
		if (analysis.matchCheck && typeof analysis.matchCheck === 'object' && 'exactMatches' in analysis.matchCheck) {
			const { exactMatches, trimmedMatches, caseInsensitiveMatches } = analysis.matchCheck as any;
			
			if (exactMatches.length === 0) {
				analysis.recommendations.push('⚠️ WARNING: No exact matches between user IDs and review.user fields!');
				
				if (trimmedMatches.length > 0) {
					analysis.recommendations.push('💡 TIP: User IDs have whitespace issues. Trim them!');
				} else if (caseInsensitiveMatches.length > 0) {
					analysis.recommendations.push('💡 TIP: User IDs have case sensitivity issues.');
				} else {
					analysis.recommendations.push('💡 TIP: User IDs are completely different format. Schema mismatch!');
				}
			} else {
				analysis.recommendations.push(`✅ Found ${exactMatches.length} exact matches between users and reviews.`);
			}
		}

		return NextResponse.json(analysis, { status: 200 });

	} catch (error: any) {
		console.error('❌ Error in ID check:', error);
		return NextResponse.json(
			{ 
				error: 'Failed to check IDs', 
				message: error.message,
				stack: error.stack 
			}, 
			{ status: 500 }
		);
	}
}
