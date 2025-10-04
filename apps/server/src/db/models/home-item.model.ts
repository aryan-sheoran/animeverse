import mongoose from "mongoose";

const { Schema, model } = mongoose;

const homeItemSchema = new Schema(
	{
		show: { type: Schema.Types.ObjectId, ref: 'Show', required: true },
		section: { 
			type: String, 
			enum: ['hero', 'featured', 'popular', 'trending'], 
			required: true,
			index: true 
		},
		order: { type: Number, default: 0 },
		isActive: { type: Boolean, default: true },
		startDate: { type: Date },
		endDate: { type: Date },
	},
	{
		timestamps: true,
		collection: "home_items"
	}
);

// Indexes
homeItemSchema.index({ section: 1, order: 1 });
homeItemSchema.index({ isActive: 1 });

export const HomeItem = mongoose.models.HomeItem || model("HomeItem", homeItemSchema);
