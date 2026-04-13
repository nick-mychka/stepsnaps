import { useTheme } from "@stepsnaps/ui/theme";

// ─── Shared helpers ───────────────────────────────────────────────────────────

function useDark() {
  const { resolvedTheme } = useTheme();
  return resolvedTheme === "dark";
}

const SVG = {
  viewBox: "0 0 1440 900" as const,
  fill: "none" as const,
  xmlns: "http://www.w3.org/2000/svg",
  className: "h-full w-full",
  preserveAspectRatio: "xMidYMid slice" as const,
};

function Wrap({
  preview,
  children,
}: {
  preview: boolean;
  children: React.ReactNode;
}) {
  if (preview) return <>{children}</>;
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {children}
    </div>
  );
}

// ─── V1 — Thorny Path  ░░ Dark & Subtle ─────────────────────────────────────
//
// The main metaphor: a winding, dashed road from the first application
// to the final offer, lined with thorns (obstacles) and red dead-ends
// (rejections). Every milestone glows.
//
// Style: dark battle-map, subdued but detailed.

export function BackgroundV1({ preview = false }: { preview?: boolean }) {
  const dark = useDark();

  const c = dark
    ? {
        p1: "#4f46e5",
        p2: "#7c3aed",
        p3: "#0ea5e9",
        rej: "#ef4444",
        fin: "#22c55e",
        thorn: "rgba(255,255,255,0.55)",
      }
    : {
        p1: "#3730a3",
        p2: "#6d28d9",
        p3: "#0369a1",
        rej: "#dc2626",
        fin: "#15803d",
        thorn: "rgba(15,23,42,0.55)",
      };

  const pathOp = dark ? 0.32 : 0.22;
  const glowOp = dark ? 0.14 : 0.08;
  const rejOp = dark ? 0.28 : 0.18;
  const msOp = dark ? 0.4 : 0.25;
  const thornOp = dark ? 0.12 : 0.08;

  const gId = (s: string) => (preview ? `${s}P` : s);

  // V-shaped thorn spikes [base_x, base_y, tip1_x, tip1_y, tip2_x, tip2_y]
  const thorns: number[][] = [
    [175, 866, 169, 854, 181, 854],
    [255, 857, 249, 845, 261, 845],
    [338, 847, 332, 835, 344, 835],
    [430, 824, 424, 812, 436, 812],
    [476, 812, 468, 808, 476, 800],
    [458, 740, 446, 736, 458, 726],
    [412, 718, 400, 714, 412, 704],
    [352, 690, 340, 686, 352, 676],
    [364, 648, 356, 640, 368, 636],
    [408, 618, 400, 610, 412, 606],
    [464, 604, 456, 596, 468, 592],
    [528, 594, 520, 586, 532, 582],
    [578, 588, 572, 578, 582, 576],
    [616, 556, 608, 546, 620, 542],
    [624, 534, 616, 524, 628, 520],
    [612, 506, 604, 496, 616, 492],
    [602, 478, 594, 468, 606, 464],
    [544, 450, 536, 440, 548, 436],
    [524, 436, 516, 426, 528, 422],
    [586, 410, 578, 400, 590, 396],
    [634, 396, 626, 386, 638, 382],
    [696, 382, 688, 372, 700, 368],
    [742, 374, 734, 364, 746, 360],
    [800, 366, 792, 356, 804, 352],
    [848, 348, 840, 338, 852, 334],
    [872, 320, 864, 310, 876, 306],
    [876, 292, 868, 282, 880, 278],
    [850, 270, 842, 260, 854, 256],
    [846, 256, 838, 246, 850, 242],
    [794, 242, 786, 232, 798, 228],
    [752, 226, 744, 216, 756, 212],
    [756, 210, 748, 200, 760, 196],
    [790, 162, 782, 152, 794, 148],
    [848, 152, 840, 142, 852, 138],
    [912, 142, 904, 132, 916, 128],
    [988, 134, 980, 124, 992, 120],
    [1060, 128, 1052, 118, 1064, 114],
    [1134, 116, 1126, 106, 1138, 102],
    [1202, 100, 1194, 90, 1206, 86],
    [1266, 80, 1258, 70, 1270, 66],
  ];

  const milestones = [
    {
      cx: 100,
      cy: 870,
      r: 8,
      label: "Start",
      dx: 14,
      dy: 5,
      col: c.p1,
      op: 0.55,
    },
    {
      cx: 420,
      cy: 820,
      r: 5,
      label: "Polish CV",
      dx: 12,
      dy: 5,
      col: c.p2,
      op: msOp,
    },
    {
      cx: 360,
      cy: 680,
      r: 5,
      label: "Job Boards",
      dx: 12,
      dy: 5,
      col: c.p2,
      op: msOp,
    },
    {
      cx: 600,
      cy: 580,
      r: 5,
      label: "First Reply",
      dx: 12,
      dy: 5,
      col: c.p2,
      op: msOp,
    },
    {
      cx: 610,
      cy: 492,
      r: 5,
      label: "Recruiter Call",
      dx: 12,
      dy: 5,
      col: c.p2,
      op: msOp,
    },
    {
      cx: 688,
      cy: 380,
      r: 5,
      label: "Phone Screen",
      dx: 12,
      dy: 5,
      col: c.p2,
      op: msOp,
    },
    {
      cx: 842,
      cy: 342,
      r: 5,
      label: "Tech Interview",
      dx: 12,
      dy: 5,
      col: c.p2,
      op: msOp,
    },
    {
      cx: 844,
      cy: 258,
      r: 5,
      label: "System Design",
      dx: 12,
      dy: 5,
      col: c.p2,
      op: msOp,
    },
    {
      cx: 880,
      cy: 148,
      r: 5,
      label: "Final Round",
      dx: 12,
      dy: 5,
      col: c.p2,
      op: msOp,
    },
    {
      cx: 1128,
      cy: 112,
      r: 5,
      label: "Ref. Check",
      dx: 12,
      dy: 5,
      col: c.p3,
      op: msOp,
    },
    {
      cx: 1322,
      cy: 52,
      r: 10,
      label: "Offer! 🎉",
      dx: -76,
      dy: -13,
      col: c.fin,
      op: 0.65,
      glow: true,
    },
  ];

  const deadEnds = [
    {
      d: "M 420 820 C 510 844,586 868,612 896",
      lx: 536,
      ly: 888,
      label: "rejected",
    },
    {
      d: "M 600 580 C 684 566,762 552,832 534",
      lx: 760,
      ly: 530,
      label: "no reply",
    },
    {
      d: "M 840 342 C 910 318,968 302,994 274 C 1014 256,1008 238,992 228",
      lx: 962,
      ly: 272,
      label: "not this time",
    },
    {
      d: "M 1128 112 C 1174 88,1216 72,1234 46",
      lx: 1160,
      ly: 44,
      label: "so close...",
    },
  ];

  return (
    <Wrap preview={preview}>
      <svg {...SVG}>
        <defs>
          <linearGradient id={gId("v1g")} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={c.p1} />
            <stop offset="45%" stopColor={c.p2} />
            <stop offset="100%" stopColor={c.p3} />
          </linearGradient>
          {/* Soft glow layer under main path */}
          <filter id={gId("v1blur")} x="-5%" y="-5%" width="110%" height="110%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
          </filter>
          <filter
            id={gId("v1end")}
            x="-80%"
            y="-80%"
            width="260%"
            height="260%"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter
            id={gId("v1rej")}
            x="-30%"
            y="-30%"
            width="160%"
            height="160%"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Glow layer (blurred duplicate) */}
        <path
          d="M 100 870 C 220 860,340 845,420 820 C 500 795,520 765,480 740
             C 440 715,360 706,342 682 C 320 655,358 624,420 610
             C 480 596,560 606,600 580 C 640 554,642 520,610 494
             C 578 468,502 464,522 440 C 542 416,620 400,688 382
             C 748 366,802 366,842 342 C 882 318,882 284,844 260
             C 806 244,750 244,752 214 C 754 184,804 164,882 148
             C 960 132,1060 132,1128 112 C 1188 94,1244 74,1322 52"
          stroke={`url(#${gId("v1g")})`}
          strokeWidth="8"
          strokeLinecap="round"
          opacity={glowOp}
          filter={`url(#${gId("v1blur")})`}
        />

        {/* Main dashed path */}
        <path
          d="M 100 870 C 220 860,340 845,420 820 C 500 795,520 765,480 740
             C 440 715,360 706,342 682 C 320 655,358 624,420 610
             C 480 596,560 606,600 580 C 640 554,642 520,610 494
             C 578 468,502 464,522 440 C 542 416,620 400,688 382
             C 748 366,802 366,842 342 C 882 318,882 284,844 260
             C 806 244,750 244,752 214 C 754 184,804 164,882 148
             C 960 132,1060 132,1128 112 C 1188 94,1244 74,1322 52"
          stroke={`url(#${gId("v1g")})`}
          strokeWidth="2.5"
          strokeDasharray="12 6"
          strokeLinecap="round"
          opacity={pathOp}
        />

        {/* Dead ends */}
        {deadEnds.map((b, i) => (
          <g key={i}>
            <path
              d={b.d}
              stroke={c.rej}
              strokeWidth="2"
              strokeDasharray="5 5"
              strokeLinecap="round"
              opacity={rejOp}
              filter={`url(#${gId("v1rej")})`}
            />
            <text
              x={b.lx}
              y={b.ly}
              fontSize="9"
              fill={c.rej}
              opacity={rejOp * 0.8}
              fontFamily="monospace"
            >
              {b.label}
            </text>
          </g>
        ))}

        {/* Thorns */}
        {thorns.map((t, i) => (
          <g key={i}>
            <line
              x1={t[0]}
              y1={t[1]}
              x2={t[2]}
              y2={t[3]}
              stroke={c.thorn}
              strokeWidth="1.3"
              strokeLinecap="round"
              opacity={thornOp}
            />
            <line
              x1={t[0]}
              y1={t[1]}
              x2={t[4]}
              y2={t[5]}
              stroke={c.thorn}
              strokeWidth="1.3"
              strokeLinecap="round"
              opacity={thornOp}
            />
          </g>
        ))}

        {/* Milestone pulse rings + dots */}
        {milestones.map(({ cx, cy, r, label, dx, dy, col, op, glow }, i) => (
          <g key={i}>
            {glow && (
              <circle
                cx={cx}
                cy={cy}
                r={r + 10}
                fill="none"
                stroke={col}
                strokeWidth="1"
                opacity={op * 0.3}
                filter={`url(#${gId("v1end")})`}
              />
            )}
            <circle
              cx={cx}
              cy={cy}
              r={r + 4}
              fill="none"
              stroke={col}
              strokeWidth="1"
              opacity={op * 0.25}
            />
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill={col}
              opacity={op}
              filter={glow ? `url(#${gId("v1end")})` : undefined}
            />
            <text
              x={cx + dx}
              y={cy + dy}
              fontSize="10"
              fill={dark ? "white" : "#0f172a"}
              opacity={op * 0.6}
              fontFamily="monospace"
              fontWeight={glow ? "bold" : "normal"}
            >
              {label}
            </text>
          </g>
        ))}
      </svg>
    </Wrap>
  );
}

// ─── V2 — Galaxy Network  ░░ Inspiring & Bold ────────────────────────────────
//
// Job hunting is networking. Nodes = people/companies, edges = connections.
// Dense chaos at the bottom-left (start), sparse bright galaxy at top-right
// (offer zone). Hub nodes glow with corona rings.
//
// Style: inspiring, expansive, space-like.

export function BackgroundV2({ preview = false }: { preview?: boolean }) {
  const dark = useDark();
  const gId = (s: string) => (preview ? `${s}P` : s);

  const edgeOp = dark ? 0.07 : 0.05;
  const nodeOp = dark ? 0.22 : 0.14;
  const accentOp = dark ? 0.55 : 0.38;
  const hubOp = dark ? 0.45 : 0.28;
  const finCol = dark ? "#22c55e" : "#15803d";
  const baseCol = dark ? "255,255,255" : "15,23,42";
  const accentCol = dark ? "#818cf8" : "#4f46e5";
  const hubCol = dark ? "#c084fc" : "#7c3aed";

  // Nodes spread across the canvas; denser bottom-left, sparser top-right
  const nodes = [
    // bottom row — dense start zone
    { x: 60, y: 850 },
    { x: 160, y: 840 },
    { x: 270, y: 860 },
    { x: 390, y: 845 },
    { x: 510, y: 855 },
    { x: 640, y: 840 },
    { x: 770, y: 850 },
    { x: 900, y: 838 },
    { x: 1040, y: 845 },
    { x: 1180, y: 840 },
    { x: 1310, y: 848 },
    { x: 1400, y: 840 },
    // row 2
    { x: 100, y: 740 },
    { x: 230, y: 755 },
    { x: 380, y: 738 },
    { x: 530, y: 750 },
    { x: 680, y: 735 },
    { x: 830, y: 748 },
    { x: 980, y: 732 },
    { x: 1130, y: 742 },
    { x: 1280, y: 730 },
    { x: 1390, y: 738 },
    // row 3
    { x: 60, y: 630 },
    { x: 200, y: 648 },
    { x: 370, y: 625 },
    { x: 550, y: 640 },
    { x: 730, y: 618 },
    { x: 910, y: 632 },
    { x: 1080, y: 615 },
    { x: 1240, y: 628 },
    { x: 1380, y: 620 },
    // row 4
    { x: 140, y: 510 },
    { x: 320, y: 528 },
    { x: 510, y: 505 },
    { x: 700, y: 520 },
    { x: 890, y: 500 },
    { x: 1060, y: 515 },
    { x: 1220, y: 498 },
    { x: 1370, y: 510 },
    // row 5
    { x: 80, y: 390 },
    { x: 270, y: 410 },
    { x: 470, y: 385 },
    { x: 670, y: 400 },
    { x: 870, y: 378 },
    { x: 1050, y: 395 },
    { x: 1230, y: 375 },
    { x: 1390, y: 385 },
    // row 6
    { x: 160, y: 270 },
    { x: 380, y: 290 },
    { x: 610, y: 265 },
    { x: 840, y: 282 },
    { x: 1060, y: 260 },
    { x: 1260, y: 278 },
    { x: 1400, y: 265 },
    // top — sparse success zone
    { x: 260, y: 148 },
    { x: 540, y: 132 },
    { x: 820, y: 148 },
    { x: 1060, y: 128 },
    { x: 1280, y: 140 },
    { x: 1400, y: 130 },
  ];

  // Hub milestones (brighter large nodes)
  const hubs = [
    { x: 100, y: 870, label: "Start" },
    { x: 530, y: 640, label: "First Reply" },
    { x: 700, y: 400, label: "Interview" },
    { x: 1060, y: 260, label: "Final Round" },
    { x: 1280, y: 140, label: "Offer! 🎉" },
  ];

  // Build edges: connect nodes within distance threshold
  const edges: [number, number, number, number, number][] = []; // x1,y1,x2,y2,distNorm
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i];
      const b = nodes[j];
      if (!a || !b) continue;
      const dx = a.x - b.x,
        dy = a.y - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 220) {
        // distNorm: 0 = far from success, 1 = near success
        const avgX = (a.x + b.x) / 2;
        const avgY = (a.y + b.y) / 2;
        const norm = (avgX / 1440 + (1 - avgY / 900)) / 2;
        edges.push([a.x, a.y, b.x, b.y, norm]);
      }
    }
  }

  return (
    <Wrap preview={preview}>
      <svg {...SVG}>
        <defs>
          <radialGradient id={gId("v2bg")} cx="75%" cy="15%" r="70%">
            <stop
              offset="0%"
              stopColor={dark ? "#1e1b4b" : "#ede9fe"}
              stopOpacity={dark ? 0.6 : 0.5}
            />
            <stop
              offset="100%"
              stopColor={dark ? "#000000" : "#ffffff"}
              stopOpacity="0"
            />
          </radialGradient>
          <filter
            id={gId("v2glow")}
            x="-60%"
            y="-60%"
            width="220%"
            height="220%"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter
            id={gId("v2hub")}
            x="-80%"
            y="-80%"
            width="260%"
            height="260%"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Ambient background glow toward success zone */}
        <rect width="1440" height="900" fill={`url(#${gId("v2bg")})`} />

        {/* Edges — opacity increases near success zone */}
        {edges.map(([x1, y1, x2, y2, norm], i) => (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={`rgb(${baseCol})`}
            strokeWidth={norm > 0.6 ? 1.2 : 0.8}
            opacity={edgeOp + norm * edgeOp * 2.5}
          />
        ))}

        {/* Regular nodes */}
        {nodes.map(({ x, y }, i) => {
          const norm = (x / 1440 + (1 - y / 900)) / 2;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={norm > 0.6 ? 3 : 2}
              fill={norm > 0.6 ? accentCol : `rgb(${baseCol})`}
              opacity={norm > 0.6 ? accentOp : nodeOp}
            />
          );
        })}

        {/* Hub nodes with corona rings */}
        {hubs.map(({ x, y, label }, i) => {
          const isEnd = i === hubs.length - 1;
          const col = isEnd ? finCol : i > 2 ? accentCol : hubCol;
          return (
            <g key={i} filter={`url(#${gId(isEnd ? "v2hub" : "v2glow")})`}>
              <circle
                cx={x}
                cy={y}
                r={isEnd ? 20 : 14}
                fill="none"
                stroke={col}
                strokeWidth="1"
                opacity={hubOp * 0.3}
              />
              <circle
                cx={x}
                cy={y}
                r={isEnd ? 12 : 8}
                fill="none"
                stroke={col}
                strokeWidth="1"
                opacity={hubOp * 0.5}
              />
              <circle
                cx={x}
                cy={y}
                r={isEnd ? 6 : 4}
                fill={col}
                opacity={isEnd ? 0.75 : hubOp}
              />
              <text
                x={x + (isEnd ? -60 : 12)}
                y={y + (isEnd ? -14 : 5)}
                fontSize={isEnd ? "11" : "10"}
                fill={dark ? "white" : "#0f172a"}
                opacity={isEnd ? 0.55 : 0.3}
                fontFamily="monospace"
                fontWeight={isEnd ? "bold" : "normal"}
              >
                {label}
              </text>
            </g>
          );
        })}
      </svg>
    </Wrap>
  );
}

// ─── V3 — Ribbon Timelines  ░░ Dark & Bold ───────────────────────────────────
//
// Every line = one job search attempt. They all start from the bottom,
// rise through the process, and most snap closed with a red cut — rejection.
// Only one ribbon flows all the way to the top and glows green: your offer.
// The denser the bottom, the more attempts made. The sparse top: rareness of success.
//
// Style: dramatic, story-telling, emotionally resonant.

export function BackgroundV3({ preview = false }: { preview?: boolean }) {
  const dark = useDark();
  const gId = (s: string) => (preview ? `${s}P` : s);

  const successCol = dark ? "#22c55e" : "#15803d";
  const rejectCol = dark ? "#f87171" : "#ef4444";
  const ribbonOp = dark ? 0.22 : 0.14;
  const successOp = dark ? 0.7 : 0.55;

  // Rejected ribbons: each starts at bottom, rises some height then terminates
  // [startX, startY, cp1x, cp1y, cp2x, cp2y, endX, endY]
  const rejected: number[][] = [
    [80, 900, 60, 720, 40, 560, 100, 480],
    [180, 900, 200, 700, 180, 500, 220, 400],
    [310, 900, 330, 720, 350, 580, 290, 500],
    [440, 900, 460, 740, 440, 600, 480, 540],
    [560, 900, 580, 760, 600, 640, 540, 580],
    [680, 900, 700, 780, 680, 660, 720, 600],
    [800, 900, 820, 800, 840, 700, 780, 640],
    [920, 900, 940, 820, 960, 750, 900, 700],
    [1040, 900, 1060, 840, 1080, 780, 1020, 740],
    [1160, 900, 1180, 860, 1200, 820, 1140, 790],
    [240, 900, 220, 660, 200, 440, 260, 340],
    [380, 900, 360, 640, 320, 440, 360, 320],
    [520, 900, 540, 680, 560, 500, 500, 420],
    [660, 900, 640, 700, 620, 540, 660, 440],
    [780, 900, 800, 720, 820, 580, 760, 500],
    [900, 900, 920, 760, 940, 640, 880, 560],
    [1020, 900, 1040, 800, 1060, 700, 1000, 640],
    [140, 900, 120, 580, 100, 380, 160, 260],
    [460, 900, 440, 560, 420, 360, 480, 260],
    [700, 900, 720, 600, 740, 400, 680, 320],
  ];

  return (
    <Wrap preview={preview}>
      <svg {...SVG}>
        <defs>
          <linearGradient id={gId("v3rej")} x1="0%" y1="100%" x2="0%" y2="0%">
            <stop
              offset="0%"
              stopColor={dark ? "#6366f1" : "#4f46e5"}
              stopOpacity="0.6"
            />
            <stop offset="100%" stopColor={rejectCol} stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id={gId("v3win")} x1="0%" y1="100%" x2="0%" y2="0%">
            <stop
              offset="0%"
              stopColor={dark ? "#6366f1" : "#4f46e5"}
              stopOpacity="0.6"
            />
            <stop
              offset="40%"
              stopColor={dark ? "#a855f7" : "#7c3aed"}
              stopOpacity="0.8"
            />
            <stop offset="100%" stopColor={successCol} stopOpacity="1" />
          </linearGradient>
          <filter
            id={gId("v3glow")}
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter
            id={gId("v3win")}
            x="-30%"
            y="-30%"
            width="160%"
            height="160%"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Rejected ribbons */}
        {rejected.map((seg, i) => {
          const [sx, sy, cp1x, cp1y, cp2x, cp2y, ex, ey] = seg as [
            number,
            number,
            number,
            number,
            number,
            number,
            number,
            number,
          ];
          return (
            <g key={i}>
              <path
                d={`M ${sx} ${sy} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${ex} ${ey}`}
                stroke={`url(#${gId("v3rej")})`}
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity={ribbonOp}
              />
              <line
                x1={ex - 5}
                y1={ey - 5}
                x2={ex + 5}
                y2={ey + 5}
                stroke={rejectCol}
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity={ribbonOp * 1.5}
              />
              <line
                x1={ex + 5}
                y1={ey - 5}
                x2={ex - 5}
                y2={ey + 5}
                stroke={rejectCol}
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity={ribbonOp * 1.5}
              />
            </g>
          );
        })}

        {/* THE SUCCESS RIBBON — glows all the way to the top */}
        {/* Glow layer */}
        <path
          d="M 600 900 C 580 740, 560 560, 620 420 C 680 280, 820 180, 980 120 C 1100 72, 1240 52, 1360 30"
          stroke={`url(#${gId("v3win")})`}
          strokeWidth="6"
          strokeLinecap="round"
          opacity={0.3}
          filter={`url(#${gId("v3win")})`}
        />
        {/* Sharp line */}
        <path
          d="M 600 900 C 580 740, 560 560, 620 420 C 680 280, 820 180, 980 120 C 1100 72, 1240 52, 1360 30"
          stroke={`url(#${gId("v3win")})`}
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity={successOp}
        />

        {/* Finish glow */}
        <circle
          cx={1360}
          cy={30}
          r={10}
          fill={successCol}
          opacity={0.7}
          filter={`url(#${gId("v3glow")})`}
        />
        <text
          x={1280}
          y={22}
          fontSize="11"
          fill={successCol}
          opacity={0.65}
          fontFamily="monospace"
          fontWeight="bold"
        >
          Offer! 🎉
        </text>

        {/* Label at bottom */}
        <text
          x={40}
          y={880}
          fontSize="10"
          fill={dark ? "white" : "#0f172a"}
          opacity={0.15}
          fontFamily="monospace"
        >
          Every line is an attempt.
        </text>
      </svg>
    </Wrap>
  );
}

// ─── V4 — Hex Grid  ░░ Geometric & Calm ─────────────────────────────────────
//
// A flat-top hexagonal grid covers the entire background — like a strategy
// game map or a tech dashboard. Hexes dim at the bottom-left (chaos, start)
// and progressively brighten toward the top-right (the offer zone).
// Key hiring milestones are highlighted with labels, following the same
// calm blue palette as V2.
//
// Style: geometric, methodical, quietly satisfying.

export function BackgroundV4({ preview = false }: { preview?: boolean }) {
  const dark = useDark();
  const gId = (s: string) => (preview ? `${s}P` : s);

  // Flat-top hexagon: col spacing = 1.5r, row spacing = r*√3
  const r = 52;
  const W = r * 1.5; // horizontal distance between column centres
  const H = r * Math.sqrt(3); // vertical distance between row centres
  const COLS = Math.ceil(1460 / W) + 1;
  const ROWS = Math.ceil(960 / H) + 1;

  // SVG polygon points for a flat-top hex centred at (cx, cy)
  function hexPts(cx: number, cy: number) {
    return Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 3) * i;
      return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
    }).join(" ");
  }

  // Milestone hexes: [col, row, label]
  const milestoneMap: Record<string, string> = {
    "1,9": "Day 1",
    "3,7": "Apply",
    "5,6": "LinkedIn",
    "7,5": "Recruiter",
    "9,4": "Screen",
    "11,3": "Tech Test",
    "13,2": "Interview",
    "15,2": "Final",
    "17,1": "Ref. Check",
    "19,0": "Offer! 🎉",
  };

  // Build hex data
  interface HexCell {
    cx: number;
    cy: number;
    norm: number;
    label?: string;
  }
  const hexes: HexCell[] = [];
  for (let col = 0; col < COLS; col++) {
    for (let row = 0; row < ROWS; row++) {
      const cx = col * W;
      const cy = row * H + (col % 2 === 1 ? H / 2 : 0);
      // Proximity to top-right success corner (normalised 0→1)
      const dx = 1440 - cx,
        dy = cy; // dy positive = farther from top
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxD = Math.sqrt(1440 * 1440 + 900 * 900);
      const norm = 1 - dist / maxD;
      const label = milestoneMap[`${col},${row}`];
      hexes.push({ cx, cy, norm, label });
    }
  }

  // Theme colours (V2-inspired calm blue palette)
  const borderCol = dark ? "#6366f1" : "#4f46e5";
  const fillCol = dark ? "#312e81" : "#e0e7ff";
  const msCol = dark ? "#818cf8" : "#4f46e5";
  const finCol = dark ? "#22c55e" : "#15803d";

  return (
    <Wrap preview={preview}>
      <svg {...SVG}>
        <defs>
          <filter id={gId("v4ms")} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter
            id={gId("v4fin")}
            x="-80%"
            y="-80%"
            width="260%"
            height="260%"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Radial gradient: bright at top-right, dim at bottom-left */}
          <radialGradient id={gId("v4rg")} cx="100%" cy="0%" r="90%">
            <stop
              offset="0%"
              stopColor={dark ? "#1e1b4b" : "#c7d2fe"}
              stopOpacity={dark ? 0.5 : 0.4}
            />
            <stop
              offset="100%"
              stopColor={dark ? "#000000" : "#ffffff"}
              stopOpacity="0"
            />
          </radialGradient>
        </defs>

        {/* Ambient background wash toward success corner */}
        <rect width="1440" height="900" fill={`url(#${gId("v4rg")})`} />

        {/* Hex grid */}
        {hexes.map(({ cx, cy, norm, label }, i) => {
          const isMilestone = !!label;
          const isFinish = label === "Offer! 🎉";
          const isActive = norm > 0.48;
          const isNear = norm > 0.62;

          const borderOp = dark ? 0.04 + norm * 0.16 : 0.07 + norm * 0.18;
          const fillOp = isNear
            ? dark
              ? 0.1 + norm * 0.1
              : 0.06 + norm * 0.1
            : 0;

          return (
            <g
              key={i}
              filter={isMilestone ? `url(#${gId("v4ms")})` : undefined}
            >
              <polygon
                points={hexPts(cx, cy)}
                stroke={isMilestone ? msCol : borderCol}
                strokeWidth={isMilestone ? 1.5 : 0.8}
                fill={isActive ? fillCol : "none"}
                fillOpacity={fillOp}
                opacity={isMilestone ? Math.min(borderOp * 2.5, 0.7) : borderOp}
              />
              {isMilestone && (
                <>
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isFinish ? 7 : 4}
                    fill={isFinish ? finCol : msCol}
                    opacity={isFinish ? 0.8 : 0.65}
                    filter={isFinish ? `url(#${gId("v4fin")})` : undefined}
                  />
                  <text
                    x={cx}
                    y={cy + (isFinish ? 20 : 18)}
                    textAnchor="middle"
                    fontSize={isFinish ? "10" : "9"}
                    fill={dark ? "white" : "#1e1b4b"}
                    opacity={isFinish ? 0.6 : 0.38}
                    fontFamily="monospace"
                    fontWeight={isFinish ? "bold" : "normal"}
                  >
                    {label}
                  </text>
                </>
              )}
            </g>
          );
        })}
      </svg>
    </Wrap>
  );
}

// ─── V5 — Symbiosis  ░░ All Worlds United ────────────────────────────────────
//
// Layer 1 (deepest) — Hex Grid from V4: geometric foundation, dims at bottom-left,
//                     brightens at top-right.
// Layer 2           — Ribbon attempts from V3: faint rising lines, most cut off red.
// Layer 3           — Node network from V2: dots + edges spread across the field.
// Layer 4 (hero)    — Thorny Path from V1: the main winding road with milestones,
//                     thorns and dead-ends on top of everything.
//
// Style: rich, layered, tells the whole story in one image.

export function BackgroundV5({ preview = false }: { preview?: boolean }) {
  const dark = useDark();
  const gId = (s: string) => (preview ? `${s}P` : s);

  // ── Colours (V2-inspired calm blue + success green) ──
  const c = dark
    ? {
        p1: "#4f46e5",
        p2: "#818cf8",
        p3: "#7c3aed",
        p4: "#0ea5e9",
        rej: "#f87171",
        fin: "#22c55e",
        thorn: "rgba(255,255,255,0.5)",
        node: "255,255,255",
      }
    : {
        p1: "#3730a3",
        p2: "#6366f1",
        p3: "#6d28d9",
        p4: "#0369a1",
        rej: "#ef4444",
        fin: "#15803d",
        thorn: "rgba(15,23,42,0.5)",
        node: "15,23,42",
      };

  // ── Layer 1: Hex grid ──────────────────────────────────────────────────────
  const r = 56;
  const HW = r * 1.5;
  const HH = r * Math.sqrt(3);
  const COLS = Math.ceil(1460 / HW) + 1;
  const ROWS = Math.ceil(960 / HH) + 1;

  function hexPts(cx: number, cy: number) {
    return Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 3) * i;
      return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
    }).join(" ");
  }

  interface HexCell {
    cx: number;
    cy: number;
    norm: number;
  }
  const hexes: HexCell[] = [];
  for (let col = 0; col < COLS; col++) {
    for (let row = 0; row < ROWS; row++) {
      const cx = col * HW;
      const cy = row * HH + (col % 2 === 1 ? HH / 2 : 0);
      const dist = Math.sqrt(Math.pow(1440 - cx, 2) + Math.pow(cy, 2));
      const maxD = Math.sqrt(1440 * 1440 + 900 * 900);
      hexes.push({ cx, cy, norm: 1 - dist / maxD });
    }
  }

  // ── Layer 2: Rejected ribbons (simplified from V3) ─────────────────────────
  const ribbons: [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
  ][] = [
    [120, 920, 100, 720, 80, 520, 140, 440],
    [280, 920, 300, 700, 280, 480, 320, 380],
    [500, 920, 520, 740, 540, 580, 480, 510],
    [720, 920, 740, 780, 760, 650, 700, 590],
    [940, 920, 960, 820, 980, 740, 920, 690],
    [200, 920, 180, 620, 160, 400, 220, 300],
    [440, 920, 420, 600, 400, 400, 460, 310],
    [660, 920, 680, 660, 700, 480, 640, 400],
  ];

  // ── Layer 3: Network nodes ─────────────────────────────────────────────────
  const nodes = [
    { x: 80, y: 820 },
    { x: 200, y: 800 },
    { x: 340, y: 815 },
    { x: 490, y: 800 },
    { x: 640, y: 810 },
    { x: 790, y: 798 },
    { x: 950, y: 808 },
    { x: 1110, y: 795 },
    { x: 1270, y: 802 },
    { x: 140, y: 690 },
    { x: 300, y: 675 },
    { x: 470, y: 688 },
    { x: 640, y: 672 },
    { x: 810, y: 681 },
    { x: 980, y: 668 },
    { x: 1140, y: 675 },
    { x: 1310, y: 662 },
    { x: 60, y: 555 },
    { x: 240, y: 542 },
    { x: 430, y: 558 },
    { x: 620, y: 540 },
    { x: 810, y: 552 },
    { x: 1000, y: 535 },
    { x: 1175, y: 548 },
    { x: 1350, y: 530 },
    { x: 170, y: 415 },
    { x: 380, y: 428 },
    { x: 590, y: 410 },
    { x: 790, y: 422 },
    { x: 990, y: 405 },
    { x: 1170, y: 418 },
    { x: 1360, y: 400 },
    { x: 100, y: 275 },
    { x: 330, y: 290 },
    { x: 570, y: 272 },
    { x: 800, y: 285 },
    { x: 1020, y: 265 },
    { x: 1230, y: 278 },
    { x: 1400, y: 260 },
    { x: 240, y: 140 },
    { x: 530, y: 125 },
    { x: 820, y: 138 },
    { x: 1060, y: 118 },
    { x: 1300, y: 130 },
  ];

  const edges: [number, number, number, number, number][] = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i];
      const b = nodes[j];
      if (!a || !b) continue;
      const dx = a.x - b.x,
        dy = a.y - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 210) {
        const norm = ((a.x + b.x) / 2 / 1440 + (1 - (a.y + b.y) / 2 / 900)) / 2;
        edges.push([a.x, a.y, b.x, b.y, norm]);
      }
    }
  }

  // ── Layer 4: Main path milestones + thorns ─────────────────────────────────
  const thorns: number[][] = [
    [210, 863, 204, 851, 216, 851],
    [295, 849, 289, 837, 301, 837],
    [368, 833, 362, 821, 374, 821],
    [430, 820, 424, 808, 436, 808],
    [460, 740, 448, 736, 460, 726],
    [400, 706, 388, 702, 400, 692],
    [358, 680, 346, 676, 358, 666],
    [408, 620, 400, 612, 412, 608],
    [470, 605, 462, 597, 474, 593],
    [548, 592, 540, 584, 552, 580],
    [604, 576, 596, 566, 608, 562],
    [618, 510, 610, 500, 622, 496],
    [608, 486, 600, 476, 612, 472],
    [548, 445, 540, 435, 552, 431],
    [524, 432, 516, 422, 528, 418],
    [594, 408, 586, 398, 598, 394],
    [644, 392, 636, 382, 648, 378],
    [700, 378, 692, 368, 704, 364],
    [750, 370, 742, 360, 754, 356],
    [808, 360, 800, 350, 812, 346],
    [850, 344, 842, 334, 854, 330],
    [870, 318, 862, 308, 874, 304],
    [876, 290, 868, 280, 880, 276],
    [848, 262, 840, 252, 852, 248],
    [790, 242, 782, 232, 794, 228],
    [754, 218, 746, 208, 758, 204],
    [790, 162, 782, 152, 794, 148],
    [856, 148, 848, 138, 860, 134],
    [920, 138, 912, 128, 924, 124],
    [992, 128, 984, 118, 996, 114],
    [1066, 118, 1058, 108, 1070, 104],
    [1140, 106, 1132, 96, 1144, 92],
    [1210, 88, 1202, 78, 1214, 74],
    [1272, 68, 1264, 58, 1276, 54],
  ];

  const milestones = [
    {
      cx: 100,
      cy: 870,
      r: 8,
      label: "Start",
      dx: 14,
      dy: 5,
      col: c.p1,
      op: 0.55,
    },
    {
      cx: 420,
      cy: 820,
      r: 5,
      label: "Polish CV",
      dx: 12,
      dy: 5,
      col: c.p2,
      op: 0.38,
    },
    {
      cx: 360,
      cy: 678,
      r: 5,
      label: "Job Boards",
      dx: 12,
      dy: 5,
      col: c.p2,
      op: 0.38,
    },
    {
      cx: 600,
      cy: 578,
      r: 5,
      label: "First Reply",
      dx: 12,
      dy: 5,
      col: c.p2,
      op: 0.38,
    },
    {
      cx: 612,
      cy: 490,
      r: 5,
      label: "Recruiter Call",
      dx: 12,
      dy: 5,
      col: c.p3,
      op: 0.38,
    },
    {
      cx: 692,
      cy: 378,
      r: 5,
      label: "Phone Screen",
      dx: 12,
      dy: 5,
      col: c.p3,
      op: 0.38,
    },
    {
      cx: 844,
      cy: 340,
      r: 5,
      label: "Tech Interview",
      dx: 12,
      dy: 5,
      col: c.p3,
      op: 0.38,
    },
    {
      cx: 846,
      cy: 256,
      r: 5,
      label: "System Design",
      dx: 12,
      dy: 5,
      col: c.p3,
      op: 0.38,
    },
    {
      cx: 882,
      cy: 144,
      r: 5,
      label: "Final Round",
      dx: 12,
      dy: 5,
      col: c.p4,
      op: 0.38,
    },
    {
      cx: 1130,
      cy: 110,
      r: 5,
      label: "Ref. Check",
      dx: 12,
      dy: 5,
      col: c.p4,
      op: 0.38,
    },
    {
      cx: 1324,
      cy: 50,
      r: 10,
      label: "Offer! 🎉",
      dx: -76,
      dy: -14,
      col: c.fin,
      op: 0.7,
      glow: true,
    },
  ];

  const deadEnds = [
    {
      d: "M 420 820 C 500 840,576 866,604 894",
      lx: 530,
      ly: 888,
      label: "rejected",
    },
    {
      d: "M 600 578 C 680 562,758 546,828 526",
      lx: 758,
      ly: 524,
      label: "no reply",
    },
    {
      d: "M 844 340 C 912 316,970 300,996 272 C 1016 254,1010 236,994 226",
      lx: 964,
      ly: 270,
      label: "not this time",
    },
    {
      d: "M 1130 110 C 1176 86,1218 70,1236 44",
      lx: 1162,
      ly: 42,
      label: "so close...",
    },
  ];

  // Opacity constants
  const hexOp = dark ? 0.9 : 0.8; // multiplier on norm-based hex opacity
  const ribOp = dark ? 0.1 : 0.06;
  const nodeOp = dark ? 0.14 : 0.09;
  const edgeOp = dark ? 0.05 : 0.03;
  const pathOp = dark ? 0.35 : 0.22;
  const glowOp = dark ? 0.12 : 0.07;
  const thornOp = dark ? 0.11 : 0.07;
  const rejOp = dark ? 0.25 : 0.15;

  return (
    <Wrap preview={preview}>
      <svg {...SVG}>
        <defs>
          {/* Gradient along main path */}
          <linearGradient id={gId("v5pg")} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={c.p1} />
            <stop offset="40%" stopColor={c.p3} />
            <stop offset="100%" stopColor={c.p4} />
          </linearGradient>
          {/* Rejection ribbon gradient */}
          <linearGradient id={gId("v5rg")} x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor={c.p1} stopOpacity="0.5" />
            <stop offset="100%" stopColor={c.rej} stopOpacity="0.7" />
          </linearGradient>
          {/* Ambient radial wash toward top-right */}
          <radialGradient id={gId("v5bg")} cx="80%" cy="5%" r="75%">
            <stop
              offset="0%"
              stopColor={dark ? "#1e1b4b" : "#c7d2fe"}
              stopOpacity={dark ? 0.45 : 0.35}
            />
            <stop
              offset="100%"
              stopColor={dark ? "#000000" : "#ffffff"}
              stopOpacity="0"
            />
          </radialGradient>
          <filter id={gId("v5blur")} x="-5%" y="-5%" width="110%" height="110%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
          </filter>
          <filter
            id={gId("v5glow")}
            x="-60%"
            y="-60%"
            width="220%"
            height="220%"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter
            id={gId("v5fin")}
            x="-80%"
            y="-80%"
            width="260%"
            height="260%"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ── Ambient wash ── */}
        <rect width="1440" height="900" fill={`url(#${gId("v5bg")})`} />

        {/* ── Layer 1: Hex grid ── */}
        {hexes.map(({ cx, cy, norm }, i) => {
          const bOp = (dark ? 0.03 + norm * 0.13 : 0.05 + norm * 0.14) * hexOp;
          const fOp = norm > 0.55 ? (dark ? norm * 0.07 : norm * 0.08) : 0;
          return (
            <polygon
              key={`h${i}`}
              points={hexPts(cx, cy)}
              stroke={c.p1}
              strokeWidth="0.7"
              fill={dark ? "#312e81" : "#e0e7ff"}
              fillOpacity={fOp}
              opacity={bOp}
            />
          );
        })}

        {/* ── Layer 2: Rejected ribbons ── */}
        {ribbons.map(([sx, sy, cp1x, cp1y, cp2x, cp2y, ex, ey], i) => (
          <g key={`r${i}`}>
            <path
              d={`M ${sx} ${sy} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${ex} ${ey}`}
              stroke={`url(#${gId("v5rg")})`}
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity={ribOp}
            />
            <line
              x1={ex - 4}
              y1={ey - 4}
              x2={ex + 4}
              y2={ey + 4}
              stroke={c.rej}
              strokeWidth="1.4"
              strokeLinecap="round"
              opacity={ribOp * 1.8}
            />
            <line
              x1={ex + 4}
              y1={ey - 4}
              x2={ex - 4}
              y2={ey + 4}
              stroke={c.rej}
              strokeWidth="1.4"
              strokeLinecap="round"
              opacity={ribOp * 1.8}
            />
          </g>
        ))}

        {/* ── Layer 3: Network edges + nodes ── */}
        {edges.map(([x1, y1, x2, y2, norm], i) => (
          <line
            key={`e${i}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={`rgb(${c.node})`}
            strokeWidth="0.8"
            opacity={edgeOp + norm * edgeOp * 2}
          />
        ))}
        {nodes.map(({ x, y }, i) => {
          const norm = (x / 1440 + (1 - y / 900)) / 2;
          return (
            <circle
              key={`n${i}`}
              cx={x}
              cy={y}
              r={norm > 0.58 ? 2.5 : 1.8}
              fill={norm > 0.58 ? c.p2 : `rgb(${c.node})`}
              opacity={norm > 0.58 ? nodeOp * 2.2 : nodeOp}
            />
          );
        })}

        {/* ── Layer 4a: Glow under main path ── */}
        <path
          d="M 100 870 C 220 860,340 845,420 820 C 500 796,520 766,480 740
             C 440 716,362 706,342 682 C 322 656,360 624,420 610
             C 480 596,562 606,600 578 C 640 552,642 518,612 490
             C 580 466,504 462,524 438 C 544 414,622 398,692 380
             C 750 364,804 364,844 340 C 884 316,884 282,846 258
             C 808 242,752 242,754 212 C 756 182,806 162,882 146
             C 960 130,1062 130,1130 110 C 1190 92,1246 72,1324 50"
          stroke={`url(#${gId("v5pg")})`}
          strokeWidth="8"
          strokeLinecap="round"
          opacity={glowOp}
          filter={`url(#${gId("v5blur")})`}
        />

        {/* ── Layer 4b: Main dashed path ── */}
        <path
          d="M 100 870 C 220 860,340 845,420 820 C 500 796,520 766,480 740
             C 440 716,362 706,342 682 C 322 656,360 624,420 610
             C 480 596,562 606,600 578 C 640 552,642 518,612 490
             C 580 466,504 462,524 438 C 544 414,622 398,692 380
             C 750 364,804 364,844 340 C 884 316,884 282,846 258
             C 808 242,752 242,754 212 C 756 182,806 162,882 146
             C 960 130,1062 130,1130 110 C 1190 92,1246 72,1324 50"
          stroke={`url(#${gId("v5pg")})`}
          strokeWidth="2.5"
          strokeDasharray="12 6"
          strokeLinecap="round"
          opacity={pathOp}
        />

        {/* ── Layer 4c: Dead ends ── */}
        {deadEnds.map((b, i) => (
          <g key={`d${i}`}>
            <path
              d={b.d}
              stroke={c.rej}
              strokeWidth="1.8"
              strokeDasharray="5 5"
              strokeLinecap="round"
              opacity={rejOp}
            />
            <text
              x={b.lx}
              y={b.ly}
              fontSize="9"
              fill={c.rej}
              opacity={rejOp * 0.75}
              fontFamily="monospace"
            >
              {b.label}
            </text>
          </g>
        ))}

        {/* ── Layer 4d: Thorns ── */}
        {thorns.map((t, i) => (
          <g key={`t${i}`}>
            <line
              x1={t[0]}
              y1={t[1]}
              x2={t[2]}
              y2={t[3]}
              stroke={c.thorn}
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity={thornOp}
            />
            <line
              x1={t[0]}
              y1={t[1]}
              x2={t[4]}
              y2={t[5]}
              stroke={c.thorn}
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity={thornOp}
            />
          </g>
        ))}

        {/* ── Layer 4e: Milestones ── */}
        {milestones.map(({ cx, cy, r, label, dx, dy, col, op, glow }, i) => (
          <g
            key={`m${i}`}
            filter={glow ? `url(#${gId("v5fin")})` : `url(#${gId("v5glow")})`}
          >
            <circle
              cx={cx}
              cy={cy}
              r={r + 5}
              fill="none"
              stroke={col}
              strokeWidth="1"
              opacity={op * 0.2}
            />
            <circle cx={cx} cy={cy} r={r} fill={col} opacity={op} />
            <text
              x={cx + dx}
              y={cy + dy}
              fontSize="10"
              fill={dark ? "white" : "#0f172a"}
              opacity={op * 0.65}
              fontFamily="monospace"
              fontWeight={glow ? "bold" : "normal"}
            >
              {label}
            </text>
          </g>
        ))}
      </svg>
    </Wrap>
  );
}

// ─── V6 — Circuit Board  ░░ Tech & Precise ───────────────────────────────────
//
// A PCB (printed circuit board) aesthetic. Orthogonal traces run across the
// screen at right angles, connecting circular pads at every junction.
// Key hiring stages are rendered as IC chips — small labelled rectangles with
// pin legs on both sides. Traces and pads are dim at the bottom-left and
// gradually brighten toward the top-right (the "Offer" chip glows green).
//
// Concept: your job search is a circuit — every connection matters, every
// component plays a role, and signal finally reaches its destination.
//
// Style: technical, precise, uniquely relevant to software engineers.

export function BackgroundV6({ preview = false }: { preview?: boolean }) {
  const dark = useDark();
  const gId = (s: string) => (preview ? `${s}P` : s);

  const traceCol = dark ? "#6366f1" : "#4f46e5";
  const padCol = dark ? "#818cf8" : "#6366f1";
  const chipBg = dark ? "#1e1b4b" : "#eef2ff";
  const chipBord = dark ? "#818cf8" : "#4f46e5";
  const chipText = dark ? "#c7d2fe" : "#3730a3";
  const finBord = dark ? "#22c55e" : "#15803d";
  const finBg = dark ? "#052e16" : "#dcfce7";
  const finText = dark ? "#4ade80" : "#15803d";

  // ── Trace network ──────────────────────────────────────────────────────────
  // Horizontal rails at fixed y-positions
  const hRails = [820, 730, 640, 550, 460, 370, 280, 190, 100];
  // Vertical rails at fixed x-positions
  const vRails = [80, 200, 340, 480, 620, 760, 900, 1040, 1180, 1320];

  // Opacity per rail: brighter toward top/right
  function hRailOp(y: number) {
    const norm = 1 - y / 900;
    return dark ? 0.05 + norm * 0.18 : 0.04 + norm * 0.14;
  }
  function vRailOp(x: number) {
    const norm = x / 1440;
    return dark ? 0.05 + norm * 0.18 : 0.04 + norm * 0.14;
  }

  // Pads at every intersection
  const pads: { cx: number; cy: number; norm: number }[] = [];
  for (const x of vRails) {
    for (const y of hRails) {
      const norm = (x / 1440 + (1 - y / 900)) / 2;
      pads.push({ cx: x, cy: y, norm });
    }
  }

  // Extra orthogonal "branch" traces connecting rails (L-shaped segments)
  // Each: [x1, y1, x2, y2] — always axis-aligned
  const branches: [number, number, number, number][] = [
    // Bottom-left zone — denser, chaotic-ish
    [80, 820, 80, 730],
    [200, 820, 200, 640],
    [340, 820, 340, 730],
    [80, 730, 200, 730],
    [200, 730, 340, 730],
    [340, 730, 340, 640],
    [480, 820, 480, 640],
    [340, 640, 480, 640],
    [480, 640, 620, 640],
    [80, 640, 200, 640],
    [200, 550, 340, 550],
    [480, 730, 620, 730],
    [620, 730, 620, 640],
    [620, 550, 760, 550],
    [760, 640, 760, 550],
    [760, 640, 900, 640],
    // Mid zone
    [480, 550, 620, 550],
    [480, 460, 620, 460],
    [620, 460, 760, 460],
    [760, 460, 760, 370],
    [760, 370, 900, 370],
    [900, 460, 900, 370],
    [900, 550, 1040, 550],
    [1040, 550, 1040, 460],
    [900, 280, 1040, 280],
    [1040, 370, 1040, 280],
    [1040, 460, 1180, 460],
    // Top-right zone — sparser, signal converges
    [1040, 280, 1180, 280],
    [1180, 370, 1180, 280],
    [1180, 280, 1320, 280],
    [1320, 370, 1320, 280],
    [1180, 190, 1320, 190],
    [1320, 280, 1320, 190],
    [1040, 190, 1180, 190],
    [900, 190, 1040, 190],
    [900, 280, 900, 190],
    [760, 280, 900, 280],
    [760, 280, 760, 190],
    [620, 280, 760, 280],
    [620, 190, 760, 190],
    [480, 280, 620, 280],
    [480, 190, 620, 190],
    [340, 280, 480, 280],
    [200, 280, 340, 280],
    [80, 280, 200, 280],
    [80, 370, 80, 280],
    [200, 370, 200, 280],
    // Near-finish convergence
    [1180, 100, 1320, 100],
    [1320, 190, 1320, 100],
    [1040, 100, 1180, 100],
    [900, 100, 1040, 100],
  ];

  // ── IC Chip components ─────────────────────────────────────────────────────
  // Each chip snaps onto a rail intersection
  // { cx, cy, label, w, isFinish }
  const chips = [
    { cx: 80, cy: 820, label: "START", w: 64, isFinish: false },
    { cx: 340, cy: 640, label: "Polish CV", w: 72, isFinish: false },
    { cx: 620, cy: 550, label: "Apply", w: 60, isFinish: false },
    { cx: 760, cy: 460, label: "Recruiter", w: 76, isFinish: false },
    { cx: 900, cy: 370, label: "Screening", w: 80, isFinish: false },
    { cx: 1040, cy: 280, label: "Tech Test", w: 76, isFinish: false },
    { cx: 1180, cy: 190, label: "Interview", w: 80, isFinish: false },
    { cx: 1320, cy: 100, label: "OFFER 🎉", w: 80, isFinish: true },
  ];

  const chipH = 28; // chip rectangle height
  const pinLen = 10; // pin leg length
  const pinGap = 10; // gap between pins
  const numPins = 3; // pins per side

  return (
    <Wrap preview={preview}>
      <svg {...SVG}>
        <defs>
          <filter
            id={gId("v6glow")}
            x="-40%"
            y="-40%"
            width="180%"
            height="180%"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter
            id={gId("v6fin")}
            x="-80%"
            y="-80%"
            width="260%"
            height="260%"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id={gId("v6bg")} cx="90%" cy="0%" r="80%">
            <stop
              offset="0%"
              stopColor={dark ? "#1e1b4b" : "#eef2ff"}
              stopOpacity={dark ? 0.5 : 0.4}
            />
            <stop
              offset="100%"
              stopColor={dark ? "#000" : "#fff"}
              stopOpacity="0"
            />
          </radialGradient>
        </defs>

        {/* Ambient wash */}
        <rect width="1440" height="900" fill={`url(#${gId("v6bg")})`} />

        {/* Horizontal rails */}
        {hRails.map((y) => (
          <line
            key={`hr${y}`}
            x1={0}
            y1={y}
            x2={1440}
            y2={y}
            stroke={traceCol}
            strokeWidth="1"
            opacity={hRailOp(y)}
          />
        ))}

        {/* Vertical rails */}
        {vRails.map((x) => (
          <line
            key={`vr${x}`}
            x1={x}
            y1={0}
            x2={x}
            y2={900}
            stroke={traceCol}
            strokeWidth="1"
            opacity={vRailOp(x)}
          />
        ))}

        {/* Branch traces (slightly brighter than rails) */}
        {branches.map(([x1, y1, x2, y2], i) => {
          const mx = (x1 + x2) / 2,
            my = (y1 + y2) / 2;
          const norm = (mx / 1440 + (1 - my / 900)) / 2;
          const op = dark ? 0.08 + norm * 0.22 : 0.06 + norm * 0.18;
          return (
            <line
              key={`br${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={traceCol}
              strokeWidth="1.6"
              strokeLinecap="square"
              opacity={op}
            />
          );
        })}

        {/* Pads at intersections */}
        {pads.map(({ cx, cy, norm }, i) => {
          const isChipLoc = chips.some((ch) => ch.cx === cx && ch.cy === cy);
          if (isChipLoc) return null;
          const op = dark ? 0.08 + norm * 0.28 : 0.06 + norm * 0.22;
          return (
            <g key={`pd${i}`}>
              {/* Outer ring */}
              <circle
                cx={cx}
                cy={cy}
                r={6}
                fill="none"
                stroke={padCol}
                strokeWidth="1"
                opacity={op * 0.6}
              />
              {/* Inner filled pad */}
              <circle cx={cx} cy={cy} r={3} fill={padCol} opacity={op} />
            </g>
          );
        })}

        {/* IC Chips */}
        {chips.map(({ cx, cy, label, w, isFinish }, i) => {
          const bord = isFinish ? finBord : chipBord;
          const bg = isFinish ? finBg : chipBg;
          const text = isFinish ? finText : chipText;
          const filt = isFinish
            ? `url(#${gId("v6fin")})`
            : `url(#${gId("v6glow")})`;
          const norm = (cx / 1440 + (1 - cy / 900)) / 2;
          const op = isFinish
            ? 0.85
            : dark
              ? 0.35 + norm * 0.4
              : 0.3 + norm * 0.4;
          const pinsY = Array.from(
            { length: numPins },
            (_, k) => cy - ((numPins - 1) * pinGap) / 2 + k * pinGap,
          );

          return (
            <g key={`chip${i}`} filter={filt} opacity={op}>
              {/* Left pins */}
              {pinsY.map((py, k) => (
                <line
                  key={`lp${k}`}
                  x1={cx - w / 2 - pinLen}
                  y1={py}
                  x2={cx - w / 2}
                  y2={py}
                  stroke={bord}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              ))}
              {/* Right pins */}
              {pinsY.map((py, k) => (
                <line
                  key={`rp${k}`}
                  x1={cx + w / 2}
                  y1={py}
                  x2={cx + w / 2 + pinLen}
                  y2={py}
                  stroke={bord}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              ))}
              {/* Chip body */}
              <rect
                x={cx - w / 2}
                y={cy - chipH / 2}
                width={w}
                height={chipH}
                rx={3}
                ry={3}
                fill={bg}
                stroke={bord}
                strokeWidth="1.2"
              />
              {/* Notch (IC orientation mark) */}
              <path
                d={`M ${cx - 4} ${cy - chipH / 2} A 4 4 0 0 1 ${cx + 4} ${cy - chipH / 2}`}
                fill="none"
                stroke={bord}
                strokeWidth="1"
              />
              {/* Label */}
              <text
                x={cx}
                y={cy + 4}
                textAnchor="middle"
                fontSize={isFinish ? "9.5" : "9"}
                fill={text}
                fontFamily="monospace"
                fontWeight={isFinish ? "bold" : "normal"}
              >
                {label}
              </text>
            </g>
          );
        })}
      </svg>
    </Wrap>
  );
}

// ─── V7 — Flow Field  ░░ Organic & Mesmerising ───────────────────────────────
//
// A mathematical flow field: hundreds of particle trails drift from
// bottom-left to top-right, each following its own unique curved path
// dictated by a vector field (sin * cos waves + bias toward top-right).
//
// Dense at the bottom (chaos of early applications), the streams gradually
// converge and brighten toward the top-right — a single luminous zone
// where all paths lead: the Offer.
//
// Zero straight lines. Zero geometry. Pure organic flow.
// Inspired by wind maps, ocean currents, and aurora borealis.

export function BackgroundV7({ preview = false }: { preview?: boolean }) {
  const dark = useDark();
  const gId = (s: string) => (preview ? `${s}P` : s);

  // ── Flow field math ────────────────────────────────────────────────────────
  // Vector angle at (x, y): biased toward top-right goal point
  const GOAL = { x: 1380, y: 40 };
  const STEPS = 80;
  const STEP_LEN = 14;
  const FREQ = 0.0028;

  function fieldAngle(x: number, y: number): number {
    // Organic turbulence
    const noise =
      Math.sin(x * FREQ) * Math.cos(y * FREQ * 1.3) * Math.PI * 0.9 +
      Math.cos(x * FREQ * 0.7 + 0.5) * Math.sin(y * FREQ * 0.9) * Math.PI * 0.4;
    // Bias: pull toward goal
    const toGoal = Math.atan2(GOAL.y - y, GOAL.x - x);
    const biasPow = 0.55 + (x / 1440 + (1 - y / 900)) * 0.2; // stronger near goal
    return noise * (1 - biasPow) + toGoal * biasPow;
  }

  // Generate particle starting points on a grid over the left/bottom area
  interface Particle {
    pts: [number, number][];
  }
  const particles: Particle[] = [];

  // Grid of seeds — left edge + bottom edge + scattered interior
  const seeds: [number, number][] = [];

  // Left edge seeds
  for (let i = 0; i < 22; i++) {
    seeds.push([10 + (i % 3) * 18, 60 + i * 38]);
  }
  // Bottom edge seeds
  for (let i = 0; i < 28; i++) {
    seeds.push([30 + i * 50, 870 + (i % 2) * 20]);
  }
  // Scattered interior seeds (deterministic using trig)
  for (let i = 0; i < 60; i++) {
    const sx = 40 + Math.abs(Math.sin(i * 2.1)) * 700;
    const sy = 900 - Math.abs(Math.cos(i * 1.7)) * 800;
    if (sx < 900 && sy > 100) seeds.push([sx, sy]);
  }

  for (const [sx, sy] of seeds) {
    const pts: [number, number][] = [[sx, sy]];
    let x = sx,
      y = sy;
    for (let s = 0; s < STEPS; s++) {
      const angle = fieldAngle(x, y);
      x += Math.cos(angle) * STEP_LEN;
      y += Math.sin(angle) * STEP_LEN;
      pts.push([x, y]);
      // Stop if out of canvas
      if (x > 1460 || x < -20 || y < -20 || y > 960) break;
    }
    if (pts.length > 4) particles.push({ pts });
  }

  // Build smooth SVG path string from points (Catmull-Rom → cubic bezier approx)
  function ptsToPath(pts: [number, number][]): string {
    if (pts.length < 2) return "";
    const first = pts[0];
    if (!first) return "";
    let d = `M ${first[0].toFixed(1)} ${first[1].toFixed(1)}`;
    for (let i = 1; i < pts.length - 1; i++) {
      const p0 = pts[i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      if (!p0 || !p1 || !p2) continue;
      // Control points (simplified Catmull-Rom)
      const cp1x = p1[0] - (p2[0] - p0[0]) * 0.16;
      const cp1y = p1[1] - (p2[1] - p0[1]) * 0.16;
      const cp2x = p1[0] + (p2[0] - p0[0]) * 0.16;
      const cp2y = p1[1] + (p2[1] - p0[1]) * 0.16;
      d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p1[0].toFixed(1)} ${p1[1].toFixed(1)}`;
    }
    return d;
  }

  // Colour per particle: progress from start point toward goal (0=far, 1=near)
  function particleNorm(p: Particle): number {
    const last = p.pts[p.pts.length - 1];
    if (!last) return 0;
    return Math.min(1, (last[0] / 1440 + (1 - last[1] / 900)) / 2 + 0.1);
  }

  // Milestone labels scattered near flow convergence zone
  const labels = [
    { x: 120, y: 800, text: "Day 1" },
    { x: 290, y: 700, text: "First Apply" },
    { x: 480, y: 590, text: "LinkedIn outreach" },
    { x: 620, y: 480, text: "Recruiter call" },
    { x: 760, y: 370, text: "Tech screen" },
    { x: 920, y: 260, text: "Interviews" },
    { x: 1100, y: 155, text: "Final round" },
    { x: 1280, y: 62, text: "Offer! 🎉" },
  ];

  // Theme colours
  const colA = dark ? "#6366f1" : "#4338ca"; // cold start
  const colB = dark ? "#a78bfa" : "#7c3aed"; // mid
  const colC = dark ? "#38bdf8" : "#0284c7"; // near goal
  const finC = dark ? "#4ade80" : "#16a34a"; // offer

  return (
    <Wrap preview={preview}>
      <svg {...SVG}>
        <defs>
          {/* Multi-stop gradient: cold → warm → bright */}
          <linearGradient id={gId("v7gc")} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colA} />
            <stop offset="45%" stopColor={colB} />
            <stop offset="85%" stopColor={colC} />
            <stop offset="100%" stopColor={finC} />
          </linearGradient>

          {/* Soft ambient wash toward goal */}
          <radialGradient id={gId("v7bg")} cx="88%" cy="4%" r="65%">
            <stop
              offset="0%"
              stopColor={dark ? "#1e1b4b" : "#ddd6fe"}
              stopOpacity={dark ? 0.55 : 0.4}
            />
            <stop
              offset="100%"
              stopColor={dark ? "#000" : "#fff"}
              stopOpacity="0"
            />
          </radialGradient>

          {/* Goal glow */}
          <filter
            id={gId("v7fin")}
            x="-100%"
            y="-100%"
            width="300%"
            height="300%"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Particle glow (near-goal particles) */}
          <filter id={gId("v7pg")} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Ambient wash */}
        <rect width="1440" height="900" fill={`url(#${gId("v7bg")})`} />

        {/* Particle trails — two passes: blurred glow first, sharp on top */}
        {particles.map((p, i) => {
          const norm = particleNorm(p);
          const isHot = norm > 0.65;
          const op = dark ? 0.06 + norm * 0.22 : 0.05 + norm * 0.18;
          const d = ptsToPath(p.pts);
          return (
            <g key={i}>
              {isHot && (
                <path
                  d={d}
                  stroke={`url(#${gId("v7gc")})`}
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                  opacity={op * 0.45}
                  filter={`url(#${gId("v7pg")})`}
                />
              )}
              <path
                d={d}
                stroke={`url(#${gId("v7gc")})`}
                strokeWidth={isHot ? 1.4 : 0.9}
                fill="none"
                strokeLinecap="round"
                opacity={op}
              />
            </g>
          );
        })}

        {/* Milestone labels */}
        {labels.map(({ x, y, text }, i) => {
          const norm = (x / 1440 + (1 - y / 900)) / 2;
          const isEnd = i === labels.length - 1;
          const col = isEnd ? finC : dark ? "#c4b5fd" : "#4f46e5";
          const op = dark ? 0.2 + norm * 0.35 : 0.15 + norm * 0.3;
          return (
            <g key={i}>
              {/* Dot */}
              <circle
                cx={x}
                cy={y}
                r={isEnd ? 7 : 3.5}
                fill={col}
                opacity={isEnd ? 0.75 : op * 1.4}
                filter={isEnd ? `url(#${gId("v7fin")})` : undefined}
              />
              {/* Label */}
              <text
                x={x + 12}
                y={y + 4}
                fontSize={isEnd ? "11" : "10"}
                fill={dark ? "white" : "#1e1b4b"}
                opacity={op}
                fontFamily="monospace"
                fontWeight={isEnd ? "bold" : "normal"}
              >
                {text}
              </text>
            </g>
          );
        })}
      </svg>
    </Wrap>
  );
}

// ─── V8 — Word Scatter  ░░ Typographic & Raw ─────────────────────────────────
//
// Every word and phrase that defines a developer's job hunt floats across
// the background — small and dim at the bottom-left (the beginning, uncertain),
// growing and brightening toward the top-right (confidence, clarity, offer).
//
// Three categories of words, each with its own colour:
//   • Red   — the painful ones: "ghosted", "rejected", "no feedback"
//   • Blue  — the technical grind: "leetcode", "system design", "take-home"
//   • Green — the wins: "offer", "congrats", "you're hired"
//
// Purely typographic. No lines, no geometry. Just words.

export function BackgroundV8({ preview = false }: { preview?: boolean }) {
  const dark = useDark();
  const gId = (s: string) => (preview ? `${s}P` : s);

  interface WordEntry {
    text: string;
    x: number;
    y: number;
    size: number;
    rot: number;
    cat: "pain" | "grind" | "win" | "neutral";
  }

  // ── Word pool ──────────────────────────────────────────────────────────────
  const painWords = [
    "rejected",
    "ghosted",
    "no feedback",
    "not a fit",
    "overqualified",
    "underqualified",
    "position filled",
    "not moving forward",
    "regret to inform",
    "culture fit",
    "try again later",
    "we'll keep your CV",
    "no reply",
    "automated rejection",
    "thanks but no thanks",
    "not selected",
  ];

  const grindWords = [
    "leetcode",
    "system design",
    "take-home task",
    "SQL query",
    "Big O",
    "binary search",
    "recursion",
    "docker",
    "CI/CD",
    "pull request",
    "code review",
    "merge conflict",
    "debug",
    "unit tests",
    "algorithms",
    "data structures",
    "REST API",
    "microservices",
    "git blame",
    "refactor",
    "TypeScript",
    "React",
    "Node.js",
    "PostgreSQL",
    "Redis",
    "Kafka",
    "behavioral round",
    "STAR method",
    "whiteboard",
    "pair programming",
    "HackerRank",
    "Codility",
    "dry run",
    "time complexity",
    "OOP",
  ];

  const winWords = [
    "offer!",
    "you're hired",
    "congrats",
    "welcome aboard",
    "start date",
    "salary negotiated",
    "sign the contract",
    "accepted",
    "new chapter",
    "first day",
    "team introduction",
    "onboarding",
    "badge access",
    "first commit",
    "new slack workspace",
    "it worked!",
  ];

  const neutralWords = [
    "apply",
    "LinkedIn",
    "cover letter",
    "resume",
    "portfolio",
    "referral",
    "recruiter call",
    "phone screen",
    "intro call",
    "follow up",
    "thank you note",
    "second round",
    "final round",
    "reference check",
    "background check",
    "negotiate",
    "counter offer",
    "due diligence",
    "headhunter",
    "cold outreach",
    "networking",
    "job board",
    "indeed",
    "glassdoor",
    "day 1",
    "daily snap",
    "progress",
    "streak",
    "keep going",
    "one more day",
    "almost there",
    "you got this",
    "stay consistent",
    "track everything",
    "log the snap",
  ];

  // ── Deterministic placement using trig ────────────────────────────────────
  // We generate positions using sin/cos seeds — no Math.random(), fully
  // deterministic so SSR and client render produce the same output.
  function seed(i: number, offset: number) {
    return Math.abs(Math.sin(i * 127.1 + offset * 311.7));
  }

  const words: WordEntry[] = [];
  const allWords: { text: string; cat: WordEntry["cat"] }[] = [
    ...painWords.map((t) => ({ text: t, cat: "pain" as const })),
    ...grindWords.map((t) => ({ text: t, cat: "grind" as const })),
    ...winWords.map((t) => ({ text: t, cat: "win" as const })),
    ...neutralWords.map((t) => ({ text: t, cat: "neutral" as const })),
  ];

  allWords.forEach(({ text, cat }, i) => {
    // Base position: biased so wins cluster top-right, pain stays bottom-left
    const catBias =
      cat === "win"
        ? 0.65
        : cat === "pain"
          ? 0.2
          : cat === "grind"
            ? 0.45
            : 0.4;
    const xBase = catBias + seed(i, 1) * (1 - catBias) * 0.8;
    const yBase =
      cat === "win"
        ? seed(i, 2) * 0.4 // wins: top 40%
        : cat === "pain"
          ? 0.55 + seed(i, 2) * 0.42 // pain: bottom half
          : 0.1 + seed(i, 2) * 0.85; // rest: spread

    // Slight scatter jitter
    const jx = (seed(i, 5) - 0.5) * 0.15;
    const jy = (seed(i, 6) - 0.5) * 0.12;

    const x = Math.min(0.97, Math.max(0.02, xBase + jx)) * 1420;
    const y = Math.min(0.97, Math.max(0.02, yBase + jy)) * 880;

    // Size: bigger near top-right
    const norm = (x / 1420 + (1 - y / 880)) / 2;
    const size = 9 + norm * 13 + seed(i, 3) * 6;

    // Rotation: subtle tilt
    const rot = (seed(i, 4) - 0.5) * 22;

    words.push({ text, x, y, size, rot, cat });
  });

  // ── Colours ────────────────────────────────────────────────────────────────
  const cols = {
    pain: dark ? "#f87171" : "#ef4444",
    grind: dark ? "#818cf8" : "#4f46e5",
    win: dark ? "#4ade80" : "#15803d",
    neutral: dark ? "#94a3b8" : "#64748b",
  };

  return (
    <Wrap preview={preview}>
      <svg {...SVG}>
        <defs>
          <radialGradient id={gId("v8bg")} cx="85%" cy="5%" r="70%">
            <stop
              offset="0%"
              stopColor={dark ? "#0f172a" : "#f8fafc"}
              stopOpacity={dark ? 0.7 : 0.5}
            />
            <stop
              offset="100%"
              stopColor={dark ? "#000" : "#fff"}
              stopOpacity="0"
            />
          </radialGradient>
          <filter
            id={gId("v8glow")}
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter
            id={gId("v8fin")}
            x="-40%"
            y="-40%"
            width="180%"
            height="180%"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width="1440" height="900" fill={`url(#${gId("v8bg")})`} />

        {words.map(({ text, x, y, size, rot, cat }, i) => {
          const norm = (x / 1420 + (1 - y / 880)) / 2;
          const isWin = cat === "win";
          const isHot = norm > 0.68;
          const isOffer = text === "offer!";

          const baseOp = dark
            ? isWin
              ? 0.15 + norm * 0.5
              : 0.06 + norm * 0.28
            : isWin
              ? 0.12 + norm * 0.38
              : 0.05 + norm * 0.22;
          const op = Math.min(0.75, baseOp);

          const col = cols[cat];

          return (
            <text
              key={i}
              x={x}
              y={y}
              fontSize={size.toFixed(1)}
              fill={col}
              opacity={op}
              fontFamily="monospace"
              fontWeight={isHot || isWin ? "600" : "400"}
              transform={`rotate(${rot.toFixed(1)}, ${x.toFixed(1)}, ${y.toFixed(1)})`}
              filter={
                isOffer
                  ? `url(#${gId("v8fin")})`
                  : isHot
                    ? `url(#${gId("v8glow")})`
                    : undefined
              }
              style={{ letterSpacing: isOffer ? "0.05em" : undefined }}
            >
              {text}
            </text>
          );
        })}
      </svg>
    </Wrap>
  );
}

// ─── V9 — Deep Network  ░░ V2 Evolved ───────────────────────────────────────
//
// V2 taken much further. Same metaphor: job hunting is networking.
// But now:
//  • 3× more nodes, denser and more varied in size
//  • Curved arcs between milestone hubs (not straight lines)
//  • Gradient edges — each edge colours from its start node toward end node
//  • Stardust layer: tiny 1px specks as a cosmic background texture
//  • More milestones (9 total) with richer labels
//  • Concentric pulse rings on every hub (3 rings, decreasing opacity)
//  • Soft directional glow trail from Start → Offer
//  • Light mode: rich indigo/violet on warm cream, not just "dimmer dark"

export function BackgroundV9({ preview = false }: { preview?: boolean }) {
  const dark = useDark();
  const gId = (s: string) => (preview ? `${s}P` : s);

  // ── Colours ────────────────────────────────────────────────────────────────
  const c = dark
    ? {
        base: "148,163,184", // slate-400
        accent: "#818cf8", // indigo-400
        hub: "#c084fc", // purple-400
        arc: "#6366f1", // indigo-500
        fin: "#22c55e", // green-400
        dust: "255,255,255",
        text: "white",
        bgA: "#1e1b4b",
        bgB: "#0c0a1e",
      }
    : {
        base: "71,85,105", // slate-600
        accent: "#4f46e5", // indigo-600
        hub: "#7c3aed", // violet-600
        arc: "#4338ca", // indigo-700
        fin: "#15803d", // green-700
        dust: "15,23,42",
        text: "#0f172a",
        bgA: "#ede9fe",
        bgB: "#f8fafc",
      };

  // ── Stardust: tiny background specks ──────────────────────────────────────
  const dust = Array.from({ length: 180 }, (_, i) => ({
    x: Math.abs(Math.sin(i * 137.508) * 1440),
    y: Math.abs(Math.cos(i * 97.31) * 900),
    r: Math.abs(Math.sin(i * 53.1)) * 1.2 + 0.3,
    op:
      Math.abs(Math.cos(i * 71.4)) * (dark ? 0.18 : 0.1) + (dark ? 0.04 : 0.02),
  }));

  // ── Nodes: 3 zones, denser than V2 ───────────────────────────────────────
  const nodes = [
    // ── Zone 1: Dense start cluster (bottom-left) ──
    { x: 45, y: 870 },
    { x: 110, y: 855 },
    { x: 185, y: 875 },
    { x: 265, y: 858 },
    { x: 355, y: 868 },
    { x: 450, y: 852 },
    { x: 545, y: 862 },
    { x: 640, y: 848 },
    { x: 740, y: 857 },
    { x: 840, y: 845 },
    { x: 945, y: 853 },
    { x: 1050, y: 841 },
    { x: 1155, y: 849 },
    { x: 1265, y: 838 },
    { x: 1375, y: 845 },
    { x: 75, y: 785 },
    { x: 175, y: 770 },
    { x: 295, y: 782 },
    { x: 415, y: 768 },
    { x: 540, y: 778 },
    { x: 665, y: 762 },
    { x: 790, y: 773 },
    { x: 915, y: 758 },
    { x: 1040, y: 768 },
    { x: 1165, y: 752 },
    { x: 1295, y: 762 },
    { x: 1400, y: 750 },
    { x: 55, y: 700 },
    { x: 170, y: 688 },
    { x: 305, y: 700 },
    { x: 445, y: 684 },
    { x: 585, y: 695 },
    { x: 725, y: 678 },
    { x: 865, y: 690 },
    { x: 1005, y: 674 },
    { x: 1140, y: 685 },
    { x: 1275, y: 668 },
    { x: 1395, y: 678 },
    // ── Zone 2: Mid-journey spread ──
    { x: 90, y: 610 },
    { x: 225, y: 596 },
    { x: 375, y: 608 },
    { x: 530, y: 592 },
    { x: 685, y: 603 },
    { x: 840, y: 586 },
    { x: 990, y: 597 },
    { x: 1135, y: 580 },
    { x: 1270, y: 592 },
    { x: 1390, y: 575 },
    { x: 120, y: 515 },
    { x: 270, y: 500 },
    { x: 435, y: 512 },
    { x: 600, y: 496 },
    { x: 765, y: 508 },
    { x: 925, y: 490 },
    { x: 1070, y: 503 },
    { x: 1205, y: 486 },
    { x: 1340, y: 498 },
    { x: 155, y: 420 },
    { x: 325, y: 405 },
    { x: 505, y: 418 },
    { x: 685, y: 400 },
    { x: 860, y: 414 },
    { x: 1020, y: 396 },
    { x: 1170, y: 410 },
    { x: 1305, y: 392 },
    { x: 1410, y: 405 },
    // ── Zone 3: Sparse success cluster (top-right) ──
    { x: 190, y: 325 },
    { x: 380, y: 310 },
    { x: 580, y: 322 },
    { x: 780, y: 305 },
    { x: 970, y: 318 },
    { x: 1145, y: 300 },
    { x: 1295, y: 313 },
    { x: 1400, y: 295 },
    { x: 240, y: 228 },
    { x: 460, y: 214 },
    { x: 695, y: 226 },
    { x: 920, y: 210 },
    { x: 1110, y: 222 },
    { x: 1275, y: 205 },
    { x: 1395, y: 218 },
    { x: 320, y: 130 },
    { x: 590, y: 116 },
    { x: 870, y: 128 },
    { x: 1090, y: 112 },
    { x: 1285, y: 124 },
    { x: 1400, y: 108 },
  ];

  // ── Edges: connect within threshold, coloured by zone ─────────────────────
  interface Edge {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    norm: number;
  }
  const edges: Edge[] = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i];
      const b = nodes[j];
      if (!a || !b) continue;
      const dx = a.x - b.x,
        dy = a.y - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 195) {
        const norm = ((a.x + b.x) / 2 / 1440 + (1 - (a.y + b.y) / 2 / 900)) / 2;
        edges.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y, norm });
      }
    }
  }

  // ── Milestone hubs ─────────────────────────────────────────────────────────
  const hubs = [
    { x: 100, y: 870, r: 5, label: "Start", sub: "Day 1", isEnd: false },
    {
      x: 445,
      y: 684,
      r: 4,
      label: "Polish CV",
      sub: "craft your story",
      isEnd: false,
    },
    {
      x: 685,
      y: 603,
      r: 4,
      label: "First Apply",
      sub: "100+ sent",
      isEnd: false,
    },
    {
      x: 600,
      y: 496,
      r: 4,
      label: "Recruiter Call",
      sub: "phone screen",
      isEnd: false,
    },
    {
      x: 860,
      y: 414,
      r: 4,
      label: "Tech Interview",
      sub: "code it live",
      isEnd: false,
    },
    {
      x: 970,
      y: 318,
      r: 4,
      label: "System Design",
      sub: "scale the world",
      isEnd: false,
    },
    {
      x: 1110,
      y: 222,
      r: 4,
      label: "Final Round",
      sub: "last hurdle",
      isEnd: false,
    },
    {
      x: 1090,
      y: 112,
      r: 4,
      label: "Ref. Check",
      sub: "almost there",
      isEnd: false,
    },
    {
      x: 1340,
      y: 55,
      r: 7,
      label: "Offer! 🎉",
      sub: "you made it",
      isEnd: true,
    },
  ];

  // ── Curved arcs between consecutive hubs ──────────────────────────────────
  // Each arc bulges perpendicular to the line between two hubs
  function hubArc(
    a: (typeof hubs)[0],
    b: (typeof hubs)[0],
    bulge: number,
  ): string {
    const mx = (a.x + b.x) / 2 + bulge;
    const my = (a.y + b.y) / 2 - Math.abs(bulge) * 0.4;
    return `M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`;
  }

  const arcOp = dark ? 0.22 : 0.15;
  const arcs = hubs.slice(0, -1).flatMap((h, i) => {
    const next = hubs[i + 1];
    if (!next) return [];
    return [
      {
        d: hubArc(h, next, (i % 2 === 0 ? 1 : -1) * 60),
        norm: (h.x / 1440 + (1 - h.y / 900)) / 2,
      },
    ];
  });

  return (
    <Wrap preview={preview}>
      <svg {...SVG}>
        <defs>
          {/* Radial ambient gradient: blooms from top-right success zone */}
          <radialGradient id={gId("v9bg")} cx="78%" cy="8%" r="72%">
            <stop
              offset="0%"
              stopColor={c.bgA}
              stopOpacity={dark ? 0.65 : 0.5}
            />
            <stop
              offset="60%"
              stopColor={c.bgA}
              stopOpacity={dark ? 0.12 : 0.08}
            />
            <stop offset="100%" stopColor={c.bgB} stopOpacity="0" />
          </radialGradient>

          {/* Soft directional glow trail Start → Offer */}
          <linearGradient
            id={gId("v9trail")}
            x1="0%"
            y1="100%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor={c.arc} stopOpacity="0" />
            <stop
              offset="50%"
              stopColor={c.hub}
              stopOpacity={dark ? 0.12 : 0.07}
            />
            <stop
              offset="100%"
              stopColor={c.fin}
              stopOpacity={dark ? 0.25 : 0.15}
            />
          </linearGradient>

          {/* Edge gradient: base → accent */}
          <linearGradient id={gId("v9eg")} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={`rgb(${c.base})`} />
            <stop offset="100%" stopColor={c.accent} />
          </linearGradient>

          {/* Arc gradient */}
          <linearGradient id={gId("v9ag")} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={c.hub} stopOpacity="0.3" />
            <stop offset="100%" stopColor={c.fin} stopOpacity="0.7" />
          </linearGradient>

          {/* Hub glow */}
          <filter id={gId("v9hg")} x="-70%" y="-70%" width="240%" height="240%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Finish glow */}
          <filter
            id={gId("v9fg")}
            x="-100%"
            y="-100%"
            width="300%"
            height="300%"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Subtle blur for stardust */}
          <filter id={gId("v9df")} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.6" />
          </filter>
        </defs>

        {/* ── Ambient wash ── */}
        <rect width="1440" height="900" fill={`url(#${gId("v9bg")})`} />

        {/* ── Directional glow trail ── */}
        <rect width="1440" height="900" fill={`url(#${gId("v9trail")})`} />

        {/* ── Stardust ── */}
        {dust.map(({ x, y, r, op }, i) => (
          <circle
            key={`d${i}`}
            cx={x}
            cy={y}
            r={r}
            fill={`rgb(${c.dust})`}
            opacity={op}
            filter={`url(#${gId("v9df")})`}
          />
        ))}

        {/* ── Edges ── */}
        {edges.map(({ x1, y1, x2, y2, norm }, i) => {
          const op = dark ? 0.04 + norm * 0.14 : 0.03 + norm * 0.11;
          const bright = norm > 0.58;
          return (
            <line
              key={`e${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={bright ? c.accent : `rgb(${c.base})`}
              strokeWidth={bright ? 1.1 : 0.7}
              opacity={op}
            />
          );
        })}

        {/* ── Regular nodes ── */}
        {nodes.map(({ x, y }, i) => {
          const norm = (x / 1440 + (1 - y / 900)) / 2;
          const isHot = norm > 0.62;
          const isMid = norm > 0.42;
          const col = isHot ? c.accent : `rgb(${c.base})`;
          const r = isHot ? 2.8 : isMid ? 2.2 : 1.6;
          const op = dark
            ? isHot
              ? 0.32 + norm * 0.25
              : 0.1 + norm * 0.12
            : isHot
              ? 0.22 + norm * 0.2
              : 0.07 + norm * 0.1;
          return (
            <circle key={`n${i}`} cx={x} cy={y} r={r} fill={col} opacity={op} />
          );
        })}

        {/* ── Hub arcs (curved paths between milestones) ── */}
        {arcs.map(({ d, norm }, i) => {
          const op = arcOp + norm * arcOp * 1.2;
          return (
            <path
              key={`a${i}`}
              d={d}
              stroke={`url(#${gId("v9ag")})`}
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="6 4"
              opacity={op}
            />
          );
        })}

        {/* ── Hub milestone nodes ── */}
        {hubs.map(({ x, y, r, label, sub, isEnd }, i) => {
          const col = isEnd ? c.fin : i > 4 ? c.accent : c.hub;
          const norm = (x / 1440 + (1 - y / 900)) / 2;
          const op = dark ? 0.3 + norm * 0.45 : 0.25 + norm * 0.4;
          const filt = isEnd ? `url(#${gId("v9fg")})` : `url(#${gId("v9hg")})`;
          const pr = isEnd ? r * 2.5 : r * 2.2;

          return (
            <g key={`h${i}`} filter={filt}>
              {/* 3 concentric pulse rings */}
              {[3.2, 2.1, 1.2].map((mult, ri) => (
                <circle
                  key={ri}
                  cx={x}
                  cy={y}
                  r={pr * mult}
                  fill="none"
                  stroke={col}
                  strokeWidth="0.8"
                  opacity={op * (0.15 - ri * 0.04)}
                />
              ))}
              {/* Core dot */}
              <circle
                cx={x}
                cy={y}
                r={pr * 0.55}
                fill={col}
                opacity={Math.min(op * 1.1, 0.85)}
              />
              {/* Label */}
              <text
                x={isEnd ? x - 68 : x + pr * 1.4 + 4}
                y={isEnd ? y - 18 : y + 4}
                fontSize={isEnd ? "12" : "10.5"}
                fontWeight={isEnd ? "bold" : "600"}
                fill={dark ? "white" : "#0f172a"}
                opacity={op * 0.75}
                fontFamily="monospace"
              >
                {label}
              </text>
              {/* Sub-label */}
              {!isEnd && (
                <text
                  x={x + pr * 1.4 + 4}
                  y={y + 15}
                  fontSize="9"
                  fill={dark ? "white" : "#334155"}
                  opacity={op * 0.38}
                  fontFamily="monospace"
                >
                  {sub}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </Wrap>
  );
}

// ─── V10 — Orbital Rings  ░░ Cosmic & Structured ────────────────────────────
//
// The metaphor: your job search as a gravitational system. Each elliptical
// orbit = one phase of the journey. Company "satellites" dot every ring.
// A single trajectory arc connects all milestone tips from Start to Offer.
//
// Style: cosmic, ordered, quietly mathematical.

function orbitalPoint(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  cosA: number,
  sinA: number,
  t: number,
): { x: number; y: number } {
  return {
    x: cx + rx * Math.cos(t) * cosA - ry * Math.sin(t) * sinA,
    y: cy + rx * Math.cos(t) * sinA + ry * Math.sin(t) * cosA,
  };
}

export function BackgroundV10({ preview = false }: { preview?: boolean }) {
  const dark = useDark();
  const gId = (s: string) => (preview ? `${s}P` : s);

  const c = dark
    ? { ring: "#6366f1", dot: "#818cf8", traj: "#a78bfa", offer: "#4ade80" }
    : { ring: "#4338ca", dot: "#6366f1", traj: "#7c3aed", offer: "#15803d" };

  // All orbits share one center — bottom-left corner
  const OX = 180;
  const OY = 870;
  const A = -Math.PI / 6; // -30° tilt toward top-right
  const cosA = Math.cos(A);
  const sinA = Math.sin(A);

  const orbits = [
    { rx: 260,  ry: 86,  nDots: 5,  strokeOp: 0.08, label: null,          success: false },
    { rx: 460,  ry: 152, nDots: 7,  strokeOp: 0.11, label: "Applying",    success: false },
    { rx: 660,  ry: 218, nDots: 8,  strokeOp: 0.13, label: "Screening",   success: false },
    { rx: 870,  ry: 287, nDots: 9,  strokeOp: 0.16, label: "Interviews",  success: false },
    { rx: 1080, ry: 357, nDots: 8,  strokeOp: 0.19, label: "Final Round", success: false },
    { rx: 1290, ry: 427, nDots: 6,  strokeOp: 0.28, label: "Offer! 🎉",   success: true  },
  ];

  // Tip of each orbit at t=0 (right end of major axis → top-right after rotation)
  const tips = orbits.map((o) => orbitalPoint(OX, OY, o.rx, o.ry, cosA, sinA, 0));
  const trajD = `M ${tips.map((t) => `${t.x.toFixed(0)},${t.y.toFixed(0)}`).join(" L ")}`;

  return (
    <Wrap preview={preview}>
      <svg {...SVG}>
        <defs>
          <radialGradient id={gId("v10bg")} cx="90%" cy="5%" r="75%">
            <stop offset="0%"   stopColor={dark ? "#1e1b4b" : "#e0e7ff"} stopOpacity={dark ? 0.55 : 0.45} />
            <stop offset="100%" stopColor={dark ? "#000" : "#fff"}       stopOpacity="0" />
          </radialGradient>
          <linearGradient id={gId("v10tg")} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor={c.ring}  />
            <stop offset="60%"  stopColor={c.traj}  />
            <stop offset="100%" stopColor={c.offer} />
          </linearGradient>
          <filter id={gId("v10glo")} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id={gId("v10fin")} x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Ambient glow toward top-right */}
        <rect width="1440" height="900" fill={`url(#${gId("v10bg")})`} />

        {/* Orbital ellipses */}
        {orbits.map((orb, i) => (
          <ellipse
            key={i}
            cx={OX} cy={OY}
            rx={orb.rx} ry={orb.ry}
            transform={`rotate(-30, ${OX}, ${OY})`}
            stroke={orb.success ? c.offer : c.ring}
            strokeWidth={orb.success ? 1.5 : 0.9}
            strokeDasharray={orb.success ? undefined : "5 8"}
            fill="none"
            opacity={orb.strokeOp}
          />
        ))}

        {/* Company dots on each orbit */}
        {orbits.flatMap((orb, oi) =>
          Array.from({ length: orb.nDots }, (_, j) => {
            const t = (j / orb.nDots) * Math.PI * 2 + oi * 0.38;
            return { t, j };
          })
          .filter(({ t }) => {
            const { x, y } = orbitalPoint(OX, OY, orb.rx, orb.ry, cosA, sinA, t);
            return x >= -5 && x <= 1445 && y >= -5 && y <= 905;
          })
          .map(({ t, j }) => {
            const { x, y } = orbitalPoint(OX, OY, orb.rx, orb.ry, cosA, sinA, t);
            const prox = 1 - Math.hypot(x - 1440, y) / Math.hypot(1440, 900);
            return (
              <circle
                key={`${oi}-${j}`}
                cx={x} cy={y}
                r={orb.success ? 3 : 2}
                fill={orb.success ? c.offer : c.dot}
                opacity={Math.min(0.12 + prox * 0.55, 0.7) * (orb.success ? 1.3 : 1)}
              />
            );
          })
        )}

        {/* Trajectory through tips — glow + sharp */}
        <path d={trajD} stroke={`url(#${gId("v10tg")})`}
          strokeWidth="7" fill="none" opacity={0.07}
          filter={`url(#${gId("v10glo")})`} />
        <path d={trajD} stroke={`url(#${gId("v10tg")})`}
          strokeWidth="1.8" fill="none" opacity={0.38} strokeLinecap="round" />

        {/* Milestone rings at orbit tips */}
        {tips.map(({ x, y }, i) => {
          const orb = orbits[i];
          const prox = i / (tips.length - 1);
          return (
            <g key={i} opacity={0.18 + prox * 0.72}>
              <circle cx={x} cy={y} r={orb.success ? 18 : 10}
                fill={orb.success ? c.offer : c.ring} opacity={0.1}
                filter={orb.success ? `url(#${gId("v10fin")})` : undefined} />
              <circle cx={x} cy={y} r={orb.success ? 5.5 : 3.5}
                fill={orb.success ? c.offer : c.traj}
                filter={orb.success ? `url(#${gId("v10fin")})` : undefined} />
              {orb.label && (
                <text x={x + 10} y={y - 7}
                  fontSize={orb.success ? 12 : 9.5}
                  fill={orb.success ? c.offer : (dark ? "#e2e8f0" : "#1e1b4b")}
                  fontFamily="monospace"
                  fontWeight={orb.success ? "bold" : "normal"}
                  opacity={0.78}>
                  {orb.label}
                </text>
              )}
            </g>
          );
        })}

        {/* Origin dot */}
        <circle cx={OX} cy={OY} r={4} fill={c.ring} opacity={0.45} />
        <text x={OX + 8} y={OY - 4} fontSize="9"
          fill={dark ? "#e2e8f0" : "#1e1b4b"}
          opacity={0.35} fontFamily="monospace">Start</text>
      </svg>
    </Wrap>
  );
}

// ─── V11 — Topographic  ░░ Terrain & Elevation ───────────────────────────────
//
// The metaphor: hiring is climbing. Organic contour lines radiate from the
// peak (the Offer, top-right corner). The dashed journey trail ascends
// through each elevation band — from the lowland chaos of job boards to the
// clear summit of an accepted offer.
//
// Style: cartographic, focused, contemplative.

function organicContour(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  seed: number,
  n = 24,
): string {
  const pts = Array.from({ length: n }, (_, i) => {
    const t = (i / n) * Math.PI * 2;
    const r =
      1 +
      0.14 * Math.sin(seed * 4.1 + i * 2.3) +
      0.07 * Math.cos(seed * 2.7 + i * 4.9);
    return { x: cx + rx * Math.cos(t) * r, y: cy + ry * Math.sin(t) * r };
  });

  // Smooth closed path via quadratic beziers through midpoints (Chaikin)
  const last = pts[n - 1];
  const first = pts[0];
  let d = `M ${((last.x + first.x) / 2).toFixed(1)},${((last.y + first.y) / 2).toFixed(1)} `;
  for (let i = 0; i < n; i++) {
    const p = pts[i];
    const next = pts[(i + 1) % n];
    const mx = ((p.x + next.x) / 2).toFixed(1);
    const my = ((p.y + next.y) / 2).toFixed(1);
    d += `Q ${p.x.toFixed(1)},${p.y.toFixed(1)} ${mx},${my} `;
  }
  return d + "Z";
}

export function BackgroundV11({ preview = false }: { preview?: boolean }) {
  const dark = useDark();
  const gId = (s: string) => (preview ? `${s}P` : s);

  const c = dark
    ? { contour: "#6366f1", fill: "#3730a3", path: "#a78bfa", offer: "#4ade80" }
    : { contour: "#4338ca", fill: "#6366f1", path: "#7c3aed", offer: "#15803d" };

  // Peak = Offer (top-right)
  const PX = 1380;
  const PY = 80;

  // Opacity fields depend on `dark` — path strings are hoisted to module level
  const contours = CONTOUR_PATHS_V11.map((d, i) => ({
    d,
    fillOp:   dark ? 0.022 * (10 - i) : 0.014 * (10 - i),
    strokeOp: dark ? 0.055 + (9 - i) * 0.014 : 0.07 + (9 - i) * 0.016,
    major:    i % 3 === 0,
  }));

  // Journey trail bottom-left → peak
  const trail =
    "M 80,860 C 200,740 340,660 460,570 C 580,480 680,400 800,320 " +
    "C 920,240 1060,170 1180,130 C 1260,105 1320,90 1365,83";

  const milestones = [
    { x: 80,   y: 860, label: "Start",        offer: false },
    { x: 460,  y: 570, label: "First Apply",  offer: false },
    { x: 800,  y: 320, label: "Interviews",   offer: false },
    { x: 1180, y: 130, label: "Final Round",  offer: false },
    { x: 1365, y: 83,  label: "Offer! 🎉",    offer: true  },
  ];

  return (
    <Wrap preview={preview}>
      <svg {...SVG}>
        <defs>
          <linearGradient id={gId("v11bg")} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor={dark ? "#000" : "#fff"}       stopOpacity="0" />
            <stop offset="100%" stopColor={dark ? "#1e1b4b" : "#e0e7ff"} stopOpacity={dark ? 0.42 : 0.3} />
          </linearGradient>
          <linearGradient id={gId("v11pg")} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor={dark ? "#6366f1" : "#4338ca"} />
            <stop offset="60%"  stopColor={dark ? "#a78bfa" : "#7c3aed"} />
            <stop offset="100%" stopColor={dark ? "#4ade80" : "#15803d"} />
          </linearGradient>
          <filter id={gId("v11glo")} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id={gId("v11fin")} x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Background gradient toward peak */}
        <rect width="1440" height="900" fill={`url(#${gId("v11bg")})`} />

        {/* Contour fills (outermost first so innermost draws on top) */}
        {contours.toReversed().map(({ d, fillOp }, i) => (
          <path key={`f${i}`} d={d} fill={c.fill} fillOpacity={fillOp} stroke="none" />
        ))}

        {/* Contour lines */}
        {contours.map(({ d, strokeOp, major }, i) => (
          <path key={`l${i}`} d={d}
            stroke={c.contour}
            strokeWidth={major ? 1.2 : 0.65}
            fill="none"
            opacity={strokeOp}
          />
        ))}

        {/* Trail glow + sharp dashed */}
        <path d={trail} stroke={`url(#${gId("v11pg")})`}
          strokeWidth="8" fill="none" opacity={0.1}
          filter={`url(#${gId("v11glo")})`} />
        <path d={trail} stroke={`url(#${gId("v11pg")})`}
          strokeWidth="2" strokeDasharray="10 5"
          fill="none" opacity={0.45} strokeLinecap="round" />

        {/* Milestones */}
        {milestones.map(({ x, y, label, offer: isOffer }, i) => {
          const prox = i / (milestones.length - 1);
          return (
            <g key={i} opacity={0.22 + prox * 0.68}>
              {isOffer && (
                <circle cx={x} cy={y} r={28}
                  fill={dark ? "#4ade80" : "#15803d"} opacity={0.07}
                  filter={`url(#${gId("v11fin")})`} />
              )}
              {/* Outer ring */}
              <circle cx={x} cy={y} r={isOffer ? 12 : 8}
                stroke={isOffer ? (dark ? "#4ade80" : "#15803d") : c.contour}
                strokeWidth="0.8" fill="none" opacity={0.35} />
              {/* Core dot */}
              <circle cx={x} cy={y} r={isOffer ? 6 : 4}
                fill={isOffer ? (dark ? "#4ade80" : "#15803d") : c.path}
                filter={isOffer ? `url(#${gId("v11glo")})` : undefined} />
              <text x={x + 14} y={y - 7}
                fontSize={isOffer ? 11 : 9}
                fill={isOffer ? (dark ? "#4ade80" : "#15803d") : (dark ? "#e2e8f0" : "#1e1b4b")}
                fontFamily="monospace"
                fontWeight={isOffer ? "bold" : "normal"}
                opacity={0.82}>
                {label}
              </text>
            </g>
          );
        })}

        {/* Summit glow */}
        <circle cx={PX} cy={PY} r={40}
          fill={dark ? "#4ade80" : "#15803d"} opacity={0.06}
          filter={`url(#${gId("v11fin")})`} />

        <text x={38} y={880} fontSize="9"
          fill={dark ? "white" : "#0f172a"} opacity={0.12} fontFamily="monospace">
          Elevation: 0 → Offer
        </text>
      </svg>
    </Wrap>
  );
}

// ─── Shared helpers (deterministic, computed once at module level) ────────────

function dustField(n: number, seed: number) {
  return Array.from({ length: n }, (_, i) => ({
    x: Math.abs(Math.sin(seed * 1.3 + i * 7.41)) * 1440,
    y: Math.abs(Math.cos(seed * 2.1 + i * 5.87)) * 900,
    r: 0.5 + Math.abs(Math.sin(seed + i * 11.1)) * 1.1,
    op: 0.025 + Math.abs(Math.cos(seed + i * 8.3)) * 0.07,
  }));
}

const DUST_V12 = dustField(60, 12.4);
const DUST_V13 = dustField(50, 88.1);

// V11 contour path strings depend only on constants — computed once
const CONTOUR_PATHS_V11 = Array.from({ length: 10 }, (_, i) => {
  const scale = (i + 1) * 145;
  return organicContour(1380, 80, scale * 1.05, scale * 0.72, (i + 1) * 13.7);
});

// ─── V12 — Deep Thorny Path  ░░ V1 Pro ───────────────────────────────────────
//
// V1 refined: same winding road and thorn spikes, but with stardust texture,
// three-layer path glow, multi-ring milestone halos, and glowing dead-end
// dots. All opacities pulled back so the content breathes in front of it.
//
// Style: dark, layered, premium.

export function BackgroundV12({ preview = false }: { preview?: boolean }) {
  const dark = useDark();
  const gId = (s: string) => (preview ? `${s}P` : s);

  const c = dark
    ? { p1: "#4f46e5", p2: "#7c3aed", p3: "#0ea5e9", rej: "#ef4444", fin: "#22c55e", thorn: "rgba(255,255,255,0.4)" }
    : { p1: "#3730a3", p2: "#6d28d9", p3: "#0369a1", rej: "#dc2626", fin: "#15803d", thorn: "rgba(15,23,42,0.4)" };

  // All opacities lower than V1 — background must not compete with content
  const pathOp  = dark ? 0.20 : 0.13;
  const rejOp   = dark ? 0.16 : 0.10;
  const msOp    = dark ? 0.26 : 0.16;
  const thornOp = dark ? 0.07 : 0.045;

  const thorns: number[][] = [
    [175,866,169,854,181,854],[255,857,249,845,261,845],[338,847,332,835,344,835],
    [430,824,424,812,436,812],[476,812,468,808,476,800],[458,740,446,736,458,726],
    [412,718,400,714,412,704],[352,690,340,686,352,676],[364,648,356,640,368,636],
    [408,618,400,610,412,606],[464,604,456,596,468,592],[528,594,520,586,532,582],
    [578,588,572,578,582,576],[616,556,608,546,620,542],[624,534,616,524,628,520],
    [612,506,604,496,616,492],[602,478,594,468,606,464],[544,450,536,440,548,436],
    [524,436,516,426,528,422],[586,410,578,400,590,396],[634,396,626,386,638,382],
    [696,382,688,372,700,368],[742,374,734,364,746,360],[800,366,792,356,804,352],
    [848,348,840,338,852,334],[872,320,864,310,876,306],[876,292,868,282,880,278],
    [850,270,842,260,854,256],[846,256,838,246,850,242],[794,242,786,232,798,228],
    [752,226,744,216,756,212],[756,210,748,200,760,196],[790,162,782,152,794,148],
    [848,152,840,142,852,138],[912,142,904,132,916,128],[988,134,980,124,992,120],
    [1060,128,1052,118,1064,114],[1134,116,1126,106,1138,102],[1202,100,1194,90,1206,86],
    [1266,80,1258,70,1270,66],
  ];

  const milestones = [
    { cx:100,  cy:870, r:7,  label:"Start",         col:c.p1,  op:0.55 },
    { cx:420,  cy:820, r:4,  label:"Polish CV",      col:c.p2,  op:msOp },
    { cx:360,  cy:680, r:4,  label:"Job Boards",     col:c.p2,  op:msOp },
    { cx:600,  cy:580, r:4,  label:"First Reply",    col:c.p2,  op:msOp },
    { cx:610,  cy:492, r:4,  label:"Recruiter Call", col:c.p2,  op:msOp },
    { cx:688,  cy:380, r:4,  label:"Phone Screen",   col:c.p2,  op:msOp },
    { cx:842,  cy:342, r:4,  label:"Tech Interview", col:c.p2,  op:msOp },
    { cx:844,  cy:258, r:4,  label:"System Design",  col:c.p2,  op:msOp },
    { cx:880,  cy:148, r:4,  label:"Final Round",    col:c.p3,  op:msOp },
    { cx:1128, cy:112, r:4,  label:"Ref. Check",     col:c.p3,  op:msOp },
    { cx:1322, cy:52,  r:9,  label:"Offer! 🎉",      col:c.fin, op:0.65, glow:true },
  ];

  const deadEnds = [
    { d:"M 420 820 C 510 844,586 868,612 896",          ex:612,  ey:896 },
    { d:"M 600 580 C 684 566,762 552,832 534",          ex:832,  ey:534 },
    { d:"M 840 342 C 910 318,968 302,994 274 C 1014 256,1008 238,992 228", ex:992, ey:228 },
    { d:"M 1128 112 C 1174 88,1216 72,1234 46",         ex:1234, ey:46  },
  ];

  const mainPath =
    "M 100 870 C 220 860,340 845,420 820 C 500 795,520 765,480 740" +
    " C 440 715,360 706,342 682 C 320 655,358 624,420 610" +
    " C 480 596,560 606,600 580 C 640 554,642 520,610 494" +
    " C 578 468,514 456,544 432 C 568 414,634 408,692 386" +
    " C 750 364,818 368,846 342 C 874 316,880 288,846 262" +
    " C 812 236,750 228,756 204 C 762 180,820 160,882 144" +
    " C 940 128,1020 130,1100 116 C 1178 102,1252 86,1322 52";

  return (
    <Wrap preview={preview}>
      <svg {...SVG}>
        <defs>
          <linearGradient id={gId("v12g")} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor={c.p1} />
            <stop offset="45%"  stopColor={c.p2} />
            <stop offset="100%" stopColor={c.p3} />
          </linearGradient>
          {/* Ambient washes */}
          <radialGradient id={gId("v12s")} cx="7%" cy="97%" r="45%">
            <stop offset="0%"   stopColor={c.p1} stopOpacity={dark ? 0.18 : 0.1} />
            <stop offset="100%" stopColor={c.p1} stopOpacity="0" />
          </radialGradient>
          <radialGradient id={gId("v12e")} cx="92%" cy="6%" r="40%">
            <stop offset="0%"   stopColor={c.fin} stopOpacity={dark ? 0.12 : 0.07} />
            <stop offset="100%" stopColor={c.fin} stopOpacity="0" />
          </radialGradient>
          <filter id={gId("v12w")} x="-8%" y="-8%" width="116%" height="116%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="14" />
          </filter>
          <filter id={gId("v12b")} x="-5%" y="-5%" width="110%" height="110%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
          </filter>
          <filter id={gId("v12end")} x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id={gId("v12rj")} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Ambient start / finish washes */}
        <rect width="1440" height="900" fill={`url(#${gId("v12s")})`} />
        <rect width="1440" height="900" fill={`url(#${gId("v12e")})`} />

        {/* Stardust field */}
        {DUST_V12.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.r}
            fill={dark ? "#818cf8" : "#6366f1"} opacity={d.op} />
        ))}

        {/* Path — wide soft bloom */}
        <path d={mainPath} stroke={`url(#${gId("v12g")})`}
          strokeWidth="18" fill="none" opacity={0.04}
          filter={`url(#${gId("v12w")})`} />
        {/* Path — medium glow */}
        <path d={mainPath} stroke={`url(#${gId("v12g")})`}
          strokeWidth="6" fill="none" opacity={0.07}
          filter={`url(#${gId("v12b")})`} />
        {/* Path — sharp dashed */}
        <path d={mainPath} stroke={`url(#${gId("v12g")})`}
          strokeWidth="1.8" strokeDasharray="10 7" fill="none"
          strokeLinecap="round" opacity={pathOp} />

        {/* Thorn spikes */}
        {thorns.map((t, i) => {
          const size = 1 + (i % 3) * 0.3; // subtle size variation
          return (
            <g key={i} opacity={thornOp}>
              <line x1={t[0]} y1={t[1]} x2={t[2]} y2={t[3]}
                stroke={c.thorn} strokeWidth={size} strokeLinecap="round" />
              <line x1={t[0]} y1={t[1]} x2={t[4]} y2={t[5]}
                stroke={c.thorn} strokeWidth={size} strokeLinecap="round" />
            </g>
          );
        })}

        {/* Dead ends */}
        {deadEnds.map(({ d, ex, ey }, i) => (
          <g key={i}>
            <path d={d} stroke={c.rej} strokeWidth="1.2" strokeDasharray="4 5"
              strokeLinecap="round" opacity={rejOp} />
            {/* Glowing endpoint dot */}
            <circle cx={ex} cy={ey} r={5}
              fill={c.rej} opacity={rejOp * 0.4}
              filter={`url(#${gId("v12rj")})`} />
            <circle cx={ex} cy={ey} r={2.5}
              fill={c.rej} opacity={rejOp * 0.8} />
          </g>
        ))}

        {/* Milestones — 3-ring halos */}
        {milestones.map((m, i) => (
          <g key={i} opacity={m.op}>
            {/* Outer halo */}
            <circle cx={m.cx} cy={m.cy} r={m.r * 3.2}
              stroke={m.col} strokeWidth="0.6" fill="none" opacity={0.25} />
            {/* Mid ring */}
            <circle cx={m.cx} cy={m.cy} r={m.r * 1.9}
              stroke={m.col} strokeWidth="0.6" fill="none" opacity={0.4} />
            {/* Core */}
            <circle cx={m.cx} cy={m.cy} r={m.r}
              fill={m.col}
              filter={m.glow ? `url(#${gId("v12end")})` : undefined} />
            <text x={m.cx + m.r + 6} y={m.cy + 4}
              fontSize={m.glow ? 10 : 8.5}
              fill={m.glow ? m.col : (dark ? "#e2e8f0" : "#1e1b4b")}
              fontFamily="monospace"
              fontWeight={m.glow ? "bold" : "normal"}
              opacity={0.82}>
              {m.label}
            </text>
          </g>
        ))}
      </svg>
    </Wrap>
  );
}

// ─── V13 — Deep Ribbons  ░░ V3 Pro ───────────────────────────────────────────
//
// V3 refined: 35 attempt-ribbons (vs 20) with varying stroke width — thicker
// where the attempt climbed higher. Rejection marks upgraded to glowing
// endpoint dots. Success ribbon gains three glow layers and milestone beads
// along the winning path. Stardust texture throughout.
//
// Style: dramatic, dense, emotionally layered.

export function BackgroundV13({ preview = false }: { preview?: boolean }) {
  const dark = useDark();
  const gId = (s: string) => (preview ? `${s}P` : s);

  const successCol = dark ? "#22c55e" : "#15803d";
  const rejectCol  = dark ? "#f87171" : "#ef4444";
  // Lower than V3
  const ribbonOp  = dark ? 0.14 : 0.09;
  const successOp = dark ? 0.55 : 0.42;

  // All 20 V3 ribbons + 15 more, with extra `w` field (stroke width)
  // [sx, sy, cp1x, cp1y, cp2x, cp2y, ex, ey, w]
  const ribbons: number[][] = [
    // --- original 20 ---
    [80,900,60,720,40,560,100,480,    1.2],
    [180,900,200,700,180,500,220,400, 1.5],
    [310,900,330,720,350,580,290,500, 1.3],
    [440,900,460,740,440,600,480,540, 1.1],
    [560,900,580,760,600,640,540,580, 1.0],
    [680,900,700,780,680,660,720,600, 1.0],
    [800,900,820,800,840,700,780,640, 0.9],
    [920,900,940,820,960,750,900,700, 0.8],
    [1040,900,1060,840,1080,780,1020,740, 0.8],
    [1160,900,1180,860,1200,820,1140,790, 0.7],
    [240,900,220,660,200,440,260,340, 1.6],
    [380,900,360,640,320,440,360,320, 1.7],
    [520,900,540,680,560,500,500,420, 1.5],
    [660,900,640,700,620,540,660,440, 1.4],
    [780,900,800,720,820,580,760,500, 1.3],
    [900,900,920,760,940,640,880,560, 1.2],
    [1020,900,1040,800,1060,700,1000,640, 1.1],
    [140,900,120,580,100,380,160,260, 1.8],
    [460,900,440,560,420,360,480,260, 1.7],
    [700,900,720,600,740,400,680,320, 1.6],
    // --- 15 new ribbons ---
    [120,900,110,800,100,720,140,680,  0.9],
    [260,900,250,820,240,760,280,730,  0.8],
    [400,900,390,840,380,800,420,780,  0.8],
    [540,900,530,860,520,830,560,820,  0.7],
    [620,900,610,870,600,850,640,840,  0.7],
    [740,900,730,870,720,855,760,850,  0.7],
    [860,900,850,878,840,862,880,858,  0.7],
    [330,900,310,740,290,580,350,480,  1.4],
    [490,900,470,720,450,560,510,460,  1.3],
    [640,900,620,740,600,580,660,480,  1.2],
    [820,900,800,740,780,560,840,460,  1.1],
    [200,900,180,660,160,480,220,380,  1.5],
    [580,900,560,680,540,500,600,400,  1.3],
    [960,900,940,780,920,660,980,580,  1.0],
    [1100,900,1080,850,1060,820,1120,800, 0.8],
  ];

  // Milestone beads along the success ribbon
  const beads = [
    { cx: 580,  cy: 740, label: "Applied"      },
    { cx: 572,  cy: 530, label: "Recruiter"    },
    { cx: 628,  cy: 400, label: "Tech Screen"  },
    { cx: 760,  cy: 286, label: "Interviews"   },
    { cx: 980,  cy: 120, label: "Final Round"  },
    { cx: 1360, cy: 30,  label: "Offer! 🎉",  offer: true },
  ];

  const successPath =
    "M 600 900 C 580 740, 560 560, 620 420 C 680 280, 820 180, 980 120" +
    " C 1100 72, 1240 52, 1360 30";

  return (
    <Wrap preview={preview}>
      <svg {...SVG}>
        <defs>
          <linearGradient id={gId("v13rej")} x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%"   stopColor={dark ? "#6366f1" : "#4f46e5"} stopOpacity="0.5" />
            <stop offset="100%" stopColor={rejectCol} stopOpacity="0.7" />
          </linearGradient>
          <linearGradient id={gId("v13win")} x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%"   stopColor={dark ? "#6366f1" : "#4f46e5"} stopOpacity="0.5" />
            <stop offset="40%"  stopColor={dark ? "#a855f7" : "#7c3aed"} stopOpacity="0.7" />
            <stop offset="100%" stopColor={successCol} stopOpacity="1" />
          </linearGradient>
          {/* Soft bloom for success ribbon */}
          <filter id={gId("v13wb")} x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="16" />
          </filter>
          <filter id={gId("v13mb")} x="-8%" y="-8%" width="116%" height="116%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id={gId("v13rej")} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id={gId("v13fin")} x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Stardust */}
        {DUST_V13.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.r}
            fill={dark ? "#818cf8" : "#6366f1"} opacity={d.op} />
        ))}

        {/* Rejected ribbons */}
        {ribbons.map((seg, i) => {
          const [sx, sy, cp1x, cp1y, cp2x, cp2y, ex, ey, w] = seg as number[];
          return (
            <g key={i}>
              <path
                d={`M ${sx} ${sy} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${ex} ${ey}`}
                stroke={`url(#${gId("v13rej")})`}
                strokeWidth={w}
                strokeLinecap="round"
                opacity={ribbonOp}
              />
              {/* Glowing endpoint instead of plain X */}
              <circle cx={ex} cy={ey} r={4}
                fill={rejectCol} opacity={ribbonOp * 0.55}
                filter={`url(#${gId("v13rej")})`} />
              <circle cx={ex} cy={ey} r={1.8}
                fill={rejectCol} opacity={ribbonOp * 1.1} />
            </g>
          );
        })}

        {/* Success ribbon — 3 glow layers */}
        <path d={successPath} stroke={successCol}
          strokeWidth="24" fill="none" opacity={0.04}
          filter={`url(#${gId("v13wb")})`} />
        <path d={successPath} stroke={`url(#${gId("v13win")})`}
          strokeWidth="7" fill="none" opacity={0.12}
          filter={`url(#${gId("v13mb")})`} />
        <path d={successPath} stroke={`url(#${gId("v13win")})`}
          strokeWidth="2" strokeLinecap="round"
          fill="none" opacity={successOp} />

        {/* Milestone beads along winning ribbon */}
        {beads.map(({ cx, cy, label, offer: isOffer }, i) => {
          const prox = i / (beads.length - 1);
          return (
            <g key={i} opacity={0.3 + prox * 0.6}>
              <circle cx={cx} cy={cy} r={isOffer ? 10 : 6}
                fill={isOffer ? successCol : (dark ? "#a855f7" : "#7c3aed")}
                opacity={0.15}
                filter={isOffer ? `url(#${gId("v13fin")})` : undefined} />
              <circle cx={cx} cy={cy} r={isOffer ? 5 : 3}
                fill={isOffer ? successCol : (dark ? "#a855f7" : "#7c3aed")}
                filter={isOffer ? `url(#${gId("v13fin")})` : undefined} />
              <text x={cx + 9} y={cy - 5}
                fontSize={isOffer ? 10 : 8.5}
                fill={isOffer ? successCol : (dark ? "#e2e8f0" : "#1e1b4b")}
                fontFamily="monospace"
                fontWeight={isOffer ? "bold" : "normal"}
                opacity={0.82}>
                {label}
              </text>
            </g>
          );
        })}

        <text x={40} y={878} fontSize="9"
          fill={dark ? "white" : "#0f172a"} opacity={0.1} fontFamily="monospace">
          Every line is an attempt. One is the answer.
        </text>
      </svg>
    </Wrap>
  );
}

// Backward compat
export { BackgroundV1 as JourneyBackground };
