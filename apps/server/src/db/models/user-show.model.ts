import mongoose from "mongoose";

const { Schema, model } = mongoose;

const userShowSchema = new Schema(
	{
		userId: { type: String, ref: 'User', required: true, index: true },
		showId: { type: Schema.Types.ObjectId, ref: 'Show', required: true, index: true },
		status: { 
			type: String, 
			enum: ['watching', 'completed', 'plan-to-watch', 'on-hold', 'dropped'], 
			default: 'watching' 
		},
		isFavorite: { type: Boolean, default: false },
		currentEpisode: { type: Number, default: 0 },
		currentSeason: { type: Number, default: 1 },
		personalRating: { type: Number, min: 0, max: 10 },
		notes: { type: String },
		startedAt: { type: Date },
		completedAt: { type: Date },
		lastWatchedAt: { type: Date, default: Date.now },
	},
	{
		timestamps: true,
		collection: "user_shows"
	}
);

// Compound unique index to prevent duplicates
userShowSchema.index({ userId: 1, showId: 1 }, { unique: true });
userShowSchema.index({ status: 1 });
userShowSchema.index({ isFavorite: 1 });

export const UserShow = mongoose.models.UserShow || model("UserShow", userShowSchema);
