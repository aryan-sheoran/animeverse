import mongoose from "mongoose";

const { Schema, model } = mongoose;

const blogSchema = new Schema(
	{
		userId: { type: String, ref: 'User', required: true, index: true },
		title: { type: String, required: true },
		content: { type: String, required: true },
		excerpt: { type: String },
		coverImage: { type: String },
		tags: [{ type: String }],
		category: { type: String, default: 'general' },
		isPublished: { type: Boolean, default: true },
		likeCount: { type: Number, default: 0 },
		commentCount: { type: Number, default: 0 },
		viewCount: { type: Number, default: 0 },
		publishedAt: { type: Date },
	},
	{
		timestamps: true,
		collection: "blogs"
	}
);

// Indexes
blogSchema.index({ userId: 1, createdAt: -1 });
blogSchema.index({ isPublished: 1, publishedAt: -1 });
blogSchema.index({ likeCount: -1 });
blogSchema.index({ title: 'text', content: 'text' });

export const Blog = mongoose.models.Blog || model("Blog", blogSchema);
