import { authRouter } from "./router/auth";
import { challengeRouter } from "./router/challenge";
import { interviewRouter } from "./router/interview";
import { jobApplicationRouter } from "./router/jobApplication";
import { journeyRouter } from "./router/journey";
import { postRouter } from "./router/post";
import { snapRouter } from "./router/snap";
import { sourceRouter } from "./router/source";
import { stepDefinitionRouter } from "./router/stepDefinition";
import { teamRouter } from "./router/team";
import { todoRouter } from "./router/todo";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  challenge: challengeRouter,
  interview: interviewRouter,
  jobApplication: jobApplicationRouter,
  journey: journeyRouter,
  post: postRouter,
  snap: snapRouter,
  source: sourceRouter,
  stepDefinition: stepDefinitionRouter,
  team: teamRouter,
  todo: todoRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
