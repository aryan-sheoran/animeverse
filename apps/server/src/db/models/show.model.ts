import mongoose from "mongoose";

const { Schema, model } = mongoose;

const seasonSchema = new Schema({
	seasonNumber: { type: Number, required: true },
	title: { type: String, required: true },
	episodes: { type: Number, required: true },
	status: { type: String, enum: ['Ongoing', 'Finished', 'Upcoming'], default: 'Finished' },
	releaseDate: { type: Date },
	description: { type: String },
});

const showSchema = new Schema(
	{
		title: { type: String, required: true, index: true },
		description: { type: String },
		coverImageUrl: { type: String },
		imageUrl: { type: String },
		cardImage: { type: String },
		genres: [{ type: String }],
		rating: { type: Number, min: 0, max: 5, default: 0 },
		seasons: [seasonSchema],
		totalEpisodes: { type: Number, default: 0 },
		status: { type: String, enum: ['Ongoing', 'Completed', 'Upcoming', 'Hiatus'], default: 'Ongoing' },
		releaseYear: { type: Number },
		studio: { type: String },
		director: { type: String },
		tags: [{ type: String }],
		isFeatured: { type: Boolean, default: false },
		isPopular: { type: Boolean, default: false },
		viewCount: { type: Number, default: 0 },
		createdBy: { type: String, ref: 'User' },
	},
	{ 
		timestamps: true,
		collection: "shows" 
	}
);

// Indexes for better query performance
showSchema.index({ title: 'text', description: 'text' });
showSchema.index({ genres: 1 });
showSchema.index({ rating: -1 });
showSchema.index({ isFeatured: 1 });
showSchema.index({ isPopular: 1 });

export const Show = mongoose.models.Show || model("Show", showSchema);
