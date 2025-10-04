import mongoose from "mongoose";

const { Schema, model } = mongoose;

const seasonRatingSchema = new Schema(
	{
		userId: { type: String, ref: 'User', required: true, index: true },
		showId: { type: Schema.Types.ObjectId, ref: 'Show', required: true, index: true },
		seasonNumber: { type: Number, required: true },
		rating: { type: Number, required: true, min: 0, max: 5 },
		comment: { type: String },
	},
	{
		timestamps: true,
		collection: "season_ratings"
	}
);

// Compound unique index
seasonRatingSchema.index({ userId: 1, showId: 1, seasonNumber: 1 }, { unique: true });
seasonRatingSchema.index({ showId: 1, seasonNumber: 1 });

export const SeasonRating = mongoose.models.SeasonRating || model("SeasonRating", seasonRatingSchema);
