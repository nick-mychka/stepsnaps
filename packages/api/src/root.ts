import { authRouter } from "./router/auth";
import { journeyRouter } from "./router/journey";
import { postRouter } from "./router/post";
import { snapRouter } from "./router/snap";
import { stepDefinitionRouter } from "./router/stepDefinition";
import { teamRouter } from "./router/team";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  journey: journeyRouter,
  post: postRouter,
  snap: snapRouter,
  stepDefinition: stepDefinitionRouter,
  team: teamRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
