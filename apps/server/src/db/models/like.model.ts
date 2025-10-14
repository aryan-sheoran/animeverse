import mongoose from "mongoose";

const { Schema, model } = mongoose;

const likeSchema = new Schema(
	{
		userId: { type: Schema.Types.Mixed, ref: 'User', required: true, index: true },
		targetType: { type: String, enum: ['review', 'comment'], required: true },
		targetId: { type: Schema.Types.ObjectId, required: true, index: true },
	},
	{
		timestamps: true,
		collection: "likes"
	}
);

// Compound unique index to prevent duplicate likes
likeSchema.index({ userId: 1, targetType: 1, targetId: 1 }, { unique: true });
likeSchema.index({ targetType: 1, targetId: 1 });

export const Like = mongoose.models.Like || model("Like", likeSchema);
