import mongoose from "mongoose";

const { Schema, model } = mongoose;

const commentSchema = new Schema(
	{
		userId: { type: Schema.Types.Mixed, ref: 'User', required: true, index: true },
		targetType: { type: String, enum: ['review'], required: true },
		targetId: { type: Schema.Types.ObjectId, required: true, index: true },
		content: { type: String, required: true },
		parentCommentId: { type: Schema.Types.ObjectId, ref: 'Comment' },
		likeCount: { type: Number, default: 0 },
		isEdited: { type: Boolean, default: false },
	},
	{
		timestamps: true,
		collection: "comments"
	}
);

// Indexes
commentSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });
commentSchema.index({ userId: 1, createdAt: -1 });
commentSchema.index({ parentCommentId: 1 });

export const Comment = mongoose.models.Comment || model("Comment", commentSchema);
