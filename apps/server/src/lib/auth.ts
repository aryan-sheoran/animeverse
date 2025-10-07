import { betterAuth, type BetterAuthOptions } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { username } from "better-auth/plugins";
import { client } from "../db";

export const auth = betterAuth<BetterAuthOptions>({
	database: mongodbAdapter(client),
	trustedOrigins: [process.env.CORS_ORIGIN || ""],
	emailAndPassword: {
		enabled: true,
		sendResetPassword: async ({ user, url, token }, request) => {
			// For now, log the reset link (in production, send this via email)
			console.log("\n========== PASSWORD RESET REQUEST ==========");
			console.log(`User: ${user.email}`);
			console.log(`Reset URL: ${url}`);
			console.log(`Token: ${token}`);
			console.log("==========================================\n");
			// TODO: Implement actual email sending
			// await sendEmail({ to: user.email, subject: "Reset Password", text: `Reset: ${url}` });
		},
	},
	plugins: [username()],
	user: {
		additionalFields: {
			// username field is now provided by the username() plugin - don't duplicate it here
			bio: {
				type: "string",
				required: false,
				input: true,
			},
			location: {
				type: "string",
				required: false,
				input: true,
			},
			favoriteAnime: {
				type: "string",
				required: false,
				input: true,
			},
		},
	},
	advanced: {
		defaultCookieAttributes: {
			sameSite: "none",
			secure: true,
			httpOnly: true,
		},
	},
});
