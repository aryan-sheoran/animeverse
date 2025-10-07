import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields, usernameClient } from "better-auth/client/plugins";

// Import auth type from server (this is type-only import)
import type { auth } from "../../../server/src/lib/auth";

export const authClient = createAuthClient({
	baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
	plugins: [
		inferAdditionalFields<typeof auth>(),
		usernameClient(),
	],
});

// Export types for use in components
export type Session = typeof authClient.$Infer.Session;
export type User = typeof authClient.$Infer.Session.user;
