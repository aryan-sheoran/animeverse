import mongoose from "mongoose";

const { Schema, model } = mongoose;

const seasonRatingSchema = new Schema(
	{
		user: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			index: true
		},
		show: {
			type: Schema.Types.ObjectId,
			ref: 'Show',
			required: true,
			index: true
		},
		seasonNumber: {
			type: Number,
			required: true,
			min: 1
		},
		seasonTitle: {
			type: String,
			required: true,
			trim: true
		},
		rating: {
			type: Number,
			required: true,
			min: 0,
			max: 5 // Using 5-star rating system to match frontend
		},
		review: {
			type: String,
			trim: true,
			default: ''
		},
		episodesWatched: {
			type: Number,
			default: 0,
			min: 0
		},
		totalEpisodes: {
			type: Number,
			default: 0,
			min: 0
		}
	},
	{
		timestamps: true,
		collection: "season_ratings"
	}
);

// Compound index to prevent duplicate ratings for same user, show, and season
seasonRatingSchema.index({ user: 1, show: 1, seasonNumber: 1 }, { unique: true });

export const SeasonRating = mongoose.models.SeasonRating || model("SeasonRating", seasonRatingSchema);
