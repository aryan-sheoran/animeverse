import mongoose from "mongoose";

const { Schema, model } = mongoose;

const userSchema = new Schema(
	{
		// Better Auth actually stores ObjectIds, not Strings (confirmed via debug endpoint)
		// Leaving this flexible - MongoDB will handle both
		_id: { type: Schema.Types.Mixed },
		name: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		emailVerified: { type: Boolean, required: true },
		image: { type: String },
		createdAt: { type: Date, required: true },
		updatedAt: { type: Date, required: true },
	},
	{ collection: "user" },
);

const sessionSchema = new Schema(
	{
		_id: { type: Schema.Types.Mixed },
		expiresAt: { type: Date, required: true },
		token: { type: String, required: true, unique: true },
		createdAt: { type: Date, required: true },
		updatedAt: { type: Date, required: true },
		ipAddress: { type: String },
		userAgent: { type: String },
		userId: { type: Schema.Types.Mixed, ref: "User", required: true },
	},
	{ collection: "session" },
);

const accountSchema = new Schema(
	{
		_id: { type: Schema.Types.Mixed },
		accountId: { type: String, required: true },
		providerId: { type: String, required: true },
		userId: { type: Schema.Types.Mixed, ref: "User", required: true },
		accessToken: { type: String },
		refreshToken: { type: String },
		idToken: { type: String },
		accessTokenExpiresAt: { type: Date },
		refreshTokenExpiresAt: { type: Date },
		scope: { type: String },
		password: { type: String },
		createdAt: { type: Date, required: true },
		updatedAt: { type: Date, required: true },
	},
	{ collection: "account" },
);

const verificationSchema = new Schema(
	{
		_id: { type: Schema.Types.Mixed },
		identifier: { type: String, required: true },
		value: { type: String, required: true },
		expiresAt: { type: Date, required: true },
		createdAt: { type: Date },
		updatedAt: { type: Date },
	},
	{ collection: "verification" },
);

const User = mongoose.models.User || model("User", userSchema);
const Session = mongoose.models.Session || model("Session", sessionSchema);
const Account = mongoose.models.Account || model("Account", accountSchema);
const Verification = mongoose.models.Verification || model("Verification", verificationSchema);

export { User, Session, Account, Verification };
