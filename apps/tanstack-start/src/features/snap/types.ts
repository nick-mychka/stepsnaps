import type { RouterOutputs } from "@stepsnaps/api";

export type SnapByDate = NonNullable<RouterOutputs["snap"]["byDate"]>;

export type ViewMode = "timeline" | "chart";

export type Granularity = "daily" | "weekly";
