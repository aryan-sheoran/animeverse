import { protectedProcedure, publicProcedure } from "../lib/orpc";
import type { RouterClient } from "@orpc/server";
import { showRouter } from "./show.router";
import { reviewRouter } from "./review.router";
import { userShowRouter } from "./user-show.router";
import { blogRouter } from "./blog.router";
import { ratingRouter } from "./rating.router";
import { homeRouter } from "./home.router";

export const appRouter = {
	healthCheck: publicProcedure.handler(() => {
		return "OK";
	}),
	privateData: protectedProcedure.handler(({ context }) => {
		return {
			message: "This is private",
			user: context.session?.user,
		};
	}),
	
	// Shows
	shows: showRouter,
	
	// Reviews
	reviews: reviewRouter,
	
	// User Shows
	userShows: userShowRouter,
	
	// Blogs
	blogs: blogRouter,
	
	// Ratings
	ratings: ratingRouter,
	
	// Home Items
	home: homeRouter,
};

export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
