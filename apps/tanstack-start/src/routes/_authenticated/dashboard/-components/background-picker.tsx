import {
  BackgroundV1,
  BackgroundV2,
  BackgroundV3,
  BackgroundV4,
  BackgroundV5,
  BackgroundV6,
} from "~/components/journey-background";

export const BG_VARIANTS = [
  { id: 2, label: "Orbital Rings", Component: BackgroundV2 },
  { id: 3, label: "Deep Ribbons", Component: BackgroundV3 },
  { id: 1, label: "Deep Network", Component: BackgroundV1 },
  { id: 4, label: "Stepping Stones", Component: BackgroundV4 },
  { id: 5, label: "Momentum Grid", Component: BackgroundV5 },
  { id: 6, label: "Growing Vine", Component: BackgroundV6 },
] as const;

export type BgVariantId = (typeof BG_VARIANTS)[number]["id"];

export function BackgroundPicker({
  activeBg,
  onChange,
}: {
  activeBg: BgVariantId;
  onChange: (id: BgVariantId) => void;
}) {
  return (
    <div className="mt-8 max-w-md">
      <p className="text-muted-foreground mb-3 text-xs font-semibold tracking-widest uppercase">
        Choose background
      </p>
      <div className="grid grid-cols-4 gap-3">
        {BG_VARIANTS.map(({ id, label, Component }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={[
              "group flex flex-col gap-1.5 overflow-hidden rounded-lg border-2 p-0 transition-all",
              activeBg === id
                ? "border-primary shadow-primary/20 shadow-md"
                : "border-border hover:border-muted-foreground/50",
            ].join(" ")}
          >
            {/* Mini preview */}
            <div className="bg-muted/30 relative h-16 w-full overflow-hidden">
              <Component preview />
            </div>
            <p className="text-muted-foreground group-hover:text-foreground pb-2 text-center text-[10px] font-medium">
              {label}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
