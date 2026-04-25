import {
  BackgroundV1,
  BackgroundV2,
  BackgroundV3,
  BackgroundV4,
  BackgroundV5,
  BackgroundV6,
  BackgroundV8,
  BackgroundV10,
  BackgroundV11,
  BackgroundV12,
  BackgroundV13,
} from "~/components/journey-background";

export const BG_VARIANTS = [
  { id: 1, label: "Thorny Path", Component: BackgroundV1 },
  { id: 2, label: "Network", Component: BackgroundV2 },
  { id: 3, label: "Ribbons", Component: BackgroundV3 },
  { id: 4, label: "Hex Grid", Component: BackgroundV4 },
  { id: 5, label: "Symbiosis", Component: BackgroundV5 },
  { id: 6, label: "Circuit Board", Component: BackgroundV6 },
  // { id: 7, label: "Flow Field", Component: BackgroundV7 },
  { id: 8, label: "Word Scatter", Component: BackgroundV8 },
  { id: 10, label: "Orbital Rings", Component: BackgroundV10 },
  { id: 11, label: "Topographic", Component: BackgroundV11 },
  { id: 12, label: "Deep Thorny Path", Component: BackgroundV12 },
  { id: 13, label: "Deep Ribbons", Component: BackgroundV13 },
  // { id: 9, label: "Deep Network", Component: BackgroundV9 },
] as const;

export type BgVariantId = (typeof BG_VARIANTS)[number]["id"];

export function BackgroundPicker(props: {
  activeBg: BgVariantId;
  onChange: (id: BgVariantId) => void;
}) {
  const { activeBg, onChange } = props;
  return (
    <div className="mt-10 max-w-xl">
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
