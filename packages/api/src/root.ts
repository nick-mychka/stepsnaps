import { authRouter } from "./router/auth";
import { interviewRouter } from "./router/interview";
import { jobApplicationRouter } from "./router/jobApplication";
import { journeyRouter } from "./router/journey";
import { postRouter } from "./router/post";
import { snapRouter } from "./router/snap";
import { sourceRouter } from "./router/source";
import { stepDefinitionRouter } from "./router/stepDefinition";
import { teamRouter } from "./router/team";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  interview: interviewRouter,
  jobApplication: jobApplicationRouter,
  journey: journeyRouter,
  post: postRouter,
  snap: snapRouter,
  source: sourceRouter,
  stepDefinition: stepDefinitionRouter,
  team: teamRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
