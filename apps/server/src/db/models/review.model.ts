import mongoose from "mongoose";

const { Schema, model } = mongoose;

const reviewSchema = new Schema(
	{
		userId: { type: String, ref: 'User', required: true, index: true },
		showId: { type: Schema.Types.ObjectId, ref: 'Show', required: true, index: true },
		title: { type: String, required: true },
		content: { type: String, required: true },
		rating: { type: Number, required: true, min: 0, max: 10 },
		bestMoment: { type: String },
		worstMoment: { type: String },
		seasonNumber: { type: Number },
		episodeNumber: { type: Number },
		isPublic: { type: Boolean, default: true },
		likeCount: { type: Number, default: 0 },
		commentCount: { type: Number, default: 0 },
		viewCount: { type: Number, default: 0 },
	},
	{
		timestamps: true,
		collection: "reviews"
	}
);

// Compound indexes
reviewSchema.index({ userId: 1, showId: 1 });
reviewSchema.index({ showId: 1, createdAt: -1 });
reviewSchema.index({ rating: -1 });
reviewSchema.index({ likeCount: -1 });

export const Review = mongoose.models.Review || model("Review", reviewSchema);
