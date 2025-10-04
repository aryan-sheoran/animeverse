import { z } from "zod";
import { protectedProcedure, publicProcedure } from "../lib/orpc";
import { Blog } from "../db/models/blog.model";
import mongoose from "mongoose";

export const blogRouter = {
	// Get all public blogs
	getAll: publicProcedure
		.input(z.object({
			limit: z.number().optional().default(20),
			skip: z.number().optional().default(0),
			category: z.string().optional(),
			search: z.string().optional(),
		}))
		.handler(async ({ input }) => {
			const query: any = { isPublished: true };
			
			if (input.category) {
				query.category = input.category;
			}
			
			if (input.search) {
				query.$or = [
					{ title: { $regex: input.search, $options: 'i' } },
					{ content: { $regex: input.search, $options: 'i' } }
				];
			}
			
			const blogs = await Blog.find(query)
				.sort({ publishedAt: -1 })
				.limit(input.limit)
				.skip(input.skip)
				.populate('userId', 'name email')
				.lean();
			
			return blogs;
		}),

	// Get user's own blogs
	getMyBlogs: protectedProcedure
		.input(z.object({
			limit: z.number().optional().default(50),
			skip: z.number().optional().default(0),
		}))
		.handler(async ({ input, context }) => {
			const blogs = await Blog.find({ userId: context.session?.user?.id })
				.sort({ createdAt: -1 })
				.limit(input.limit)
				.skip(input.skip)
				.lean();
			
			return blogs;
		}),

	// Get single blog by ID
	getById: publicProcedure
		.input(z.object({
			id: z.string(),
		}))
		.handler(async ({ input }) => {
			if (!mongoose.Types.ObjectId.isValid(input.id)) {
				throw new Error("Invalid blog ID");
			}
			
			const blog = await Blog.findById(input.id)
				.populate('userId', 'name email')
				.lean();
			
			if (!blog) {
				throw new Error("Blog not found");
			}
			
			// Increment view count
			await Blog.findByIdAndUpdate(input.id, {
				$inc: { viewCount: 1 }
			});
			
			return blog;
		}),

	// Create new blog
	create: protectedProcedure
		.input(z.object({
			title: z.string().min(1),
			content: z.string().min(10),
			excerpt: z.string().optional(),
			coverImage: z.string().optional(),
			tags: z.array(z.string()).optional(),
			category: z.string().optional().default('general'),
			isPublished: z.boolean().optional().default(true),
		}))
		.handler(async ({ input, context }) => {
			const blog = await Blog.create({
				...input,
				userId: context.session?.user?.id,
				publishedAt: input.isPublished ? new Date() : undefined,
			});
			
			return blog;
		}),

	// Update blog
	update: protectedProcedure
		.input(z.object({
			id: z.string(),
			title: z.string().min(1).optional(),
			content: z.string().min(10).optional(),
			excerpt: z.string().optional(),
			coverImage: z.string().optional(),
			tags: z.array(z.string()).optional(),
			category: z.string().optional(),
			isPublished: z.boolean().optional(),
		}))
		.handler(async ({ input, context }) => {
			if (!mongoose.Types.ObjectId.isValid(input.id)) {
				throw new Error("Invalid blog ID");
			}
			
			const { id, ...updateData } = input;
			
			const updates: any = updateData;
			
			// If publishing now, set publishedAt
			if (updateData.isPublished) {
				const currentBlog = await Blog.findById(id);
				if (currentBlog && !currentBlog.publishedAt) {
					updates.publishedAt = new Date();
				}
			}
			
			const blog = await Blog.findOneAndUpdate(
				{ _id: id, userId: context.session?.user?.id },
				updates,
				{ new: true, runValidators: true }
			);
			
			if (!blog) {
				throw new Error("Blog not found or unauthorized");
			}
			
			return blog;
		}),

	// Delete blog
	delete: protectedProcedure
		.input(z.object({
			id: z.string(),
		}))
		.handler(async ({ input, context }) => {
			if (!mongoose.Types.ObjectId.isValid(input.id)) {
				throw new Error("Invalid blog ID");
			}
			
			const blog = await Blog.findOneAndDelete({
				_id: input.id,
				userId: context.session?.user?.id,
			});
			
			if (!blog) {
				throw new Error("Blog not found or unauthorized");
			}
			
			return { success: true };
		}),

	// Like blog
	like: protectedProcedure
		.input(z.object({
			id: z.string(),
		}))
		.handler(async ({ input }) => {
			if (!mongoose.Types.ObjectId.isValid(input.id)) {
				throw new Error("Invalid blog ID");
			}
			
			const blog = await Blog.findByIdAndUpdate(
				input.id,
				{ $inc: { likeCount: 1 } },
				{ new: true }
			);
			
			if (!blog) {
				throw new Error("Blog not found");
			}
			
			return blog;
		}),
};
