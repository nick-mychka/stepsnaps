import { createFileRoute } from "@tanstack/react-router";

import { ISO_DATE_REGEX } from "~/lib/date";
import { SnapFormPage } from "./-snap-form-page";

interface SnapNewSearch {
  date?: string;
}

export const Route = createFileRoute("/_authenticated/snap/new/")({
  validateSearch: (search: Record<string, unknown>): SnapNewSearch => {
    const raw = search.date;
    if (typeof raw === "string" && ISO_DATE_REGEX.test(raw)) {
      return { date: raw };
    }
    return {};
  },
  loader: ({ context }) => {
    const { trpc, queryClient } = context;
    void queryClient.prefetchQuery(trpc.journey.active.queryOptions());
    void queryClient.prefetchQuery(trpc.stepDefinition.active.queryOptions());
  },
  component: SnapFormPage,
});
