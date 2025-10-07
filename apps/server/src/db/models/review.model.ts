import mongoose from "mongoose";

const { Schema, model } = mongoose;

const reviewSchema = new Schema(
	{
		user: {
			type: String,
			ref: 'User',
			required: true,
			index: true
		},
		animeId: { // ID from the external API (e.g., Jikan)
			type: String,
			required: true
		},
		animeTitle: {
			type: String,
			required: true
		},
		animeImage: {
			type: String
		},
		seasonNumber: {
			type: Number,
		},
		episodeNumber: {
			type: Number,
		},
		rating: {
			type: Number,
			required: true,
			min: 0,
			max: 10 // Assuming a 0-10 scale, adjust if needed
		},
		title: {
			type: String,
			required: true,
			trim: true
		},
		content: {
			type: String,
			required: true,
			trim: true
		}
	},
	{
		timestamps: true,
		collection: "reviews"
	}
);

// Compound index: prevent duplicate reviews by the same user for the same episode
// This uses a partialFilterExpression so the uniqueness constraint only applies when an episodeNumber exists
reviewSchema.index(
	{ user: 1, animeId: 1, seasonNumber: 1, episodeNumber: 1 },
	{ unique: true, partialFilterExpression: { episodeNumber: { $type: 'number' } } }
);

export const Review = mongoose.models.Review || model("Review", reviewSchema);
