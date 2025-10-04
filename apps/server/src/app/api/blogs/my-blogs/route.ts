import { NextRequest, NextResponse } from "next/server";
import { Blog } from "@/db/models/blog.model";
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
		
		const blogs = await Blog.find({ userId: session.user.id })
			.sort({ createdAt: -1 })
			.lean();
		
		return NextResponse.json(blogs);
	} catch (error) {
		console.error('Error fetching blogs:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch blogs' },
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
		
		const blog = await Blog.create({
			...body,
			userId: session.user.id,
			publishedAt: body.isPublished ? new Date() : undefined,
		});
		
		return NextResponse.json(blog, { status: 201 });
	} catch (error) {
		console.error('Error creating blog:', error);
		return NextResponse.json(
			{ error: 'Failed to create blog' },
			{ status: 500 }
		);
	}
}
