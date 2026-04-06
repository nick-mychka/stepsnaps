import { initAuth } from "@stepsnaps/auth";
import { reactStartCookies } from "better-auth/react-start";

import { env } from "~/env";
import { getBaseUrl } from "~/lib/url";

export const auth = initAuth({
  baseUrl: getBaseUrl(),
  productionUrl: `https://${env.VERCEL_PROJECT_PRODUCTION_URL ?? "turbo.t3.gg"}`,
  secret: env.AUTH_SECRET,
  googleClientId: env.AUTH_GOOGLE_ID,
  googleClientSecret: env.AUTH_GOOGLE_SECRET,
  appleClientId: env.AUTH_APPLE_ID,
  appleClientSecret: env.AUTH_APPLE_SECRET,

  extraPlugins: [reactStartCookies()],
});
