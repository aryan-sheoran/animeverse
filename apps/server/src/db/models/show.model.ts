import mongoose from "mongoose";

const { Schema, model } = mongoose;

const seasonSchema = new Schema({
	seasonNumber: { type: Number, required: true },
	title: { type: String },
	description: { type: String },
	episodes: { type: Number, default: 0 },
	imageUrl: { type: String },
	releaseYear: { type: Number }
}, { _id: false });

const showSchema = new Schema(
	{
		title: { type: String, required: true, unique: true },
		description: { type: String, required: true },
		genres: [{ type: String }],
		imageUrl: { type: String },
		coverImageUrl: { type: String },
		episodes: { type: Number, default: 0 },
		seasons: [seasonSchema],
		totalSeasons: { type: Number, default: 1 },
	},
	{ 
		timestamps: true,
		collection: "show" 
	}
);

export const Show = mongoose.models.Show || model("Show", showSchema);
