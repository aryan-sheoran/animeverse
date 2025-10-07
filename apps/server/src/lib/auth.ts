import { betterAuth, type BetterAuthOptions } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { username } from "better-auth/plugins";
import { client } from "../db";

export const auth = betterAuth<BetterAuthOptions>({
	database: mongodbAdapter(client),
	trustedOrigins: [process.env.CORS_ORIGIN || ""],
	emailAndPassword: {
		enabled: true,
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
