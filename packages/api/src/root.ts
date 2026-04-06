import { authRouter } from "./router/auth";
import { journeyRouter } from "./router/journey";
import { postRouter } from "./router/post";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  journey: journeyRouter,
  post: postRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
