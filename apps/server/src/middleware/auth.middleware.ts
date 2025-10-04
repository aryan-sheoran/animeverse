import { ORPCError } from "@orpc/server";
import type { Context } from "../lib/context";

/**
 * Middleware to require authentication
 */
export const requireAuth = async ({ context, next }: { context: Context; next: any }) => {
	if (!context.session?.user) {
		throw new ORPCError("UNAUTHORIZED");
	}
	
	return next({
		context: {
			...context,
			userId: context.session.user.id,
		},
	});
};

/**
 * Middleware to optionally include user if authenticated
 */
export const optionalAuth = async ({ context, next }: { context: Context; next: any }) => {
	return next({
		context: {
			...context,
			userId: context.session?.user?.id || null,
		},
	});
};

/**
 * Middleware to check if user is admin
 */
export const requireAdmin = async ({ context, next }: { context: Context; next: any }) => {
	if (!context.session?.user) {
		throw new ORPCError("UNAUTHORIZED");
	}

	// You can add admin role check here
	// For now, we'll just pass through
	// TODO: Add admin role to user model and check here
	
	return next({
		context: {
			...context,
			userId: context.session.user.id,
		},
	});
};

/**
 * Rate limiting middleware
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export const rateLimit = (maxRequests: number = 100, windowMs: number = 60000) => {
	return async ({ context, next }: { context: Context; next: any }) => {
		const userId = context.session?.user?.id || 'anonymous';
		const now = Date.now();
		
		const userLimit = rateLimitMap.get(userId);
		
		if (userLimit) {
			if (now < userLimit.resetAt) {
				if (userLimit.count >= maxRequests) {
					throw new ORPCError("TOO_MANY_REQUESTS");
				}
				userLimit.count++;
			} else {
				rateLimitMap.set(userId, { count: 1, resetAt: now + windowMs });
			}
		} else {
			rateLimitMap.set(userId, { count: 1, resetAt: now + windowMs });
		}
		
		return next({ context });
	};
};

/**
 * Validation middleware
 */
export const validate = (schema: any) => {
	return async ({ input, next }: { input: any; next: any }) => {
		try {
			const validated = await schema.parseAsync(input);
			return next({ input: validated });
		} catch (error) {
			throw new ORPCError("BAD_REQUEST");
		}
	};
};

/**
 * Logging middleware
 */
export const logger = async ({ context, input, next }: { context: Context; input: any; next: any }) => {
	const start = Date.now();
	const userId = context.session?.user?.id || 'anonymous';
	
	console.log(`[${new Date().toISOString()}] Request from user: ${userId}`);
	
	try {
		const result = await next({ context, input });
		const duration = Date.now() - start;
		console.log(`[${new Date().toISOString()}] Success (${duration}ms)`);
		return result;
	} catch (error) {
		const duration = Date.now() - start;
		console.error(`[${new Date().toISOString()}] Error (${duration}ms):`, error);
		throw error;
	}
};
