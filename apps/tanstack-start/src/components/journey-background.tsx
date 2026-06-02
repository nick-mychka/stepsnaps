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

// ─── V3 — Deep Network  ░░ V2 Evolved ───────────────────────────────────────
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

export function BackgroundV1({ preview = false }: { preview?: boolean }) {
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

// ─── V4 — Orbital Rings  ░░ Cosmic & Structured ────────────────────────────
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

export function BackgroundV2({ preview = false }: { preview?: boolean }) {
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
    { rx: 260, ry: 86, nDots: 5, strokeOp: 0.08, label: null, success: false },
    {
      rx: 460,
      ry: 152,
      nDots: 7,
      strokeOp: 0.11,
      label: "Applying",
      success: false,
    },
    {
      rx: 660,
      ry: 218,
      nDots: 8,
      strokeOp: 0.13,
      label: "Screening",
      success: false,
    },
    {
      rx: 870,
      ry: 287,
      nDots: 9,
      strokeOp: 0.16,
      label: "Interviews",
      success: false,
    },
    {
      rx: 1080,
      ry: 357,
      nDots: 8,
      strokeOp: 0.19,
      label: "Final Round",
      success: false,
    },
    {
      rx: 1290,
      ry: 427,
      nDots: 6,
      strokeOp: 0.28,
      label: "Offer! 🎉",
      success: true,
    },
  ];

  // Tip of each orbit at t=0 (right end of major axis → top-right after rotation)
  const orbitsWithTips = orbits.map((orb) => ({
    orb,
    tip: orbitalPoint(OX, OY, orb.rx, orb.ry, cosA, sinA, 0),
  }));
  const trajD = `M ${orbitsWithTips.map(({ tip: t }) => `${t.x.toFixed(0)},${t.y.toFixed(0)}`).join(" L ")}`;

  return (
    <Wrap preview={preview}>
      <svg {...SVG}>
        <defs>
          <radialGradient id={gId("v10bg")} cx="90%" cy="5%" r="75%">
            <stop
              offset="0%"
              stopColor={dark ? "#1e1b4b" : "#e0e7ff"}
              stopOpacity={dark ? 0.55 : 0.45}
            />
            <stop
              offset="100%"
              stopColor={dark ? "#000" : "#fff"}
              stopOpacity="0"
            />
          </radialGradient>
          <linearGradient id={gId("v10tg")} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={c.ring} />
            <stop offset="60%" stopColor={c.traj} />
            <stop offset="100%" stopColor={c.offer} />
          </linearGradient>
          <filter
            id={gId("v10glo")}
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter
            id={gId("v10fin")}
            x="-80%"
            y="-80%"
            width="260%"
            height="260%"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Ambient glow toward top-right */}
        <rect width="1440" height="900" fill={`url(#${gId("v10bg")})`} />

        {/* Orbital ellipses */}
        {orbits.map((orb, i) => (
          <ellipse
            key={i}
            cx={OX}
            cy={OY}
            rx={orb.rx}
            ry={orb.ry}
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
              const { x, y } = orbitalPoint(
                OX,
                OY,
                orb.rx,
                orb.ry,
                cosA,
                sinA,
                t,
              );
              return x >= -5 && x <= 1445 && y >= -5 && y <= 905;
            })
            .map(({ t, j }) => {
              const { x, y } = orbitalPoint(
                OX,
                OY,
                orb.rx,
                orb.ry,
                cosA,
                sinA,
                t,
              );
              const prox = 1 - Math.hypot(x - 1440, y) / Math.hypot(1440, 900);
              return (
                <circle
                  key={`${oi}-${j}`}
                  cx={x}
                  cy={y}
                  r={orb.success ? 3 : 2}
                  fill={orb.success ? c.offer : c.dot}
                  opacity={
                    Math.min(0.12 + prox * 0.55, 0.7) * (orb.success ? 1.3 : 1)
                  }
                />
              );
            }),
        )}

        {/* Trajectory through tips — glow + sharp */}
        <path
          d={trajD}
          stroke={`url(#${gId("v10tg")})`}
          strokeWidth="7"
          fill="none"
          opacity={0.07}
          filter={`url(#${gId("v10glo")})`}
        />
        <path
          d={trajD}
          stroke={`url(#${gId("v10tg")})`}
          strokeWidth="1.8"
          fill="none"
          opacity={0.38}
          strokeLinecap="round"
        />

        {/* Milestone rings at orbit tips */}
        {orbitsWithTips.map(({ orb, tip: { x, y } }, i) => {
          const prox = i / (orbitsWithTips.length - 1);
          return (
            <g key={i} opacity={0.18 + prox * 0.72}>
              <circle
                cx={x}
                cy={y}
                r={orb.success ? 18 : 10}
                fill={orb.success ? c.offer : c.ring}
                opacity={0.1}
                filter={orb.success ? `url(#${gId("v10fin")})` : undefined}
              />
              <circle
                cx={x}
                cy={y}
                r={orb.success ? 5.5 : 3.5}
                fill={orb.success ? c.offer : c.traj}
                filter={orb.success ? `url(#${gId("v10fin")})` : undefined}
              />
              {orb.label && (
                <text
                  x={x + 10}
                  y={y - 7}
                  fontSize={orb.success ? 12 : 9.5}
                  fill={orb.success ? c.offer : dark ? "#e2e8f0" : "#1e1b4b"}
                  fontFamily="monospace"
                  fontWeight={orb.success ? "bold" : "normal"}
                  opacity={0.78}
                >
                  {orb.label}
                </text>
              )}
            </g>
          );
        })}

        {/* Origin dot */}
        <circle cx={OX} cy={OY} r={4} fill={c.ring} opacity={0.45} />
        <text
          x={OX + 8}
          y={OY - 4}
          fontSize="9"
          fill={dark ? "#e2e8f0" : "#1e1b4b"}
          opacity={0.35}
          fontFamily="monospace"
        >
          Start
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

const DUST_V13 = dustField(50, 88.1);

// ─── V5 — Deep Ribbons  ░░ V3 Pro ───────────────────────────────────────────
//
// V3 refined: 35 attempt-ribbons (vs 20) with varying stroke width — thicker
// where the attempt climbed higher. Rejection marks upgraded to glowing
// endpoint dots. Success ribbon gains three glow layers and milestone beads
// along the winning path. Stardust texture throughout.
//
// Style: dramatic, dense, emotionally layered.

export function BackgroundV3({ preview = false }: { preview?: boolean }) {
  const dark = useDark();
  const gId = (s: string) => (preview ? `${s}P` : s);

  const successCol = dark ? "#22c55e" : "#15803d";
  const rejectCol = dark ? "#f87171" : "#ef4444";
  // Lower than V3
  const ribbonOp = dark ? 0.14 : 0.09;
  const successOp = dark ? 0.55 : 0.42;

  // All 20 V3 ribbons + 15 more, with extra `w` field (stroke width)
  // [sx, sy, cp1x, cp1y, cp2x, cp2y, ex, ey, w]
  const ribbons: number[][] = [
    // --- original 20 ---
    [80, 900, 60, 720, 40, 560, 100, 480, 1.2],
    [180, 900, 200, 700, 180, 500, 220, 400, 1.5],
    [310, 900, 330, 720, 350, 580, 290, 500, 1.3],
    [440, 900, 460, 740, 440, 600, 480, 540, 1.1],
    [560, 900, 580, 760, 600, 640, 540, 580, 1.0],
    [680, 900, 700, 780, 680, 660, 720, 600, 1.0],
    [800, 900, 820, 800, 840, 700, 780, 640, 0.9],
    [920, 900, 940, 820, 960, 750, 900, 700, 0.8],
    [1040, 900, 1060, 840, 1080, 780, 1020, 740, 0.8],
    [1160, 900, 1180, 860, 1200, 820, 1140, 790, 0.7],
    [240, 900, 220, 660, 200, 440, 260, 340, 1.6],
    [380, 900, 360, 640, 320, 440, 360, 320, 1.7],
    [520, 900, 540, 680, 560, 500, 500, 420, 1.5],
    [660, 900, 640, 700, 620, 540, 660, 440, 1.4],
    [780, 900, 800, 720, 820, 580, 760, 500, 1.3],
    [900, 900, 920, 760, 940, 640, 880, 560, 1.2],
    [1020, 900, 1040, 800, 1060, 700, 1000, 640, 1.1],
    [140, 900, 120, 580, 100, 380, 160, 260, 1.8],
    [460, 900, 440, 560, 420, 360, 480, 260, 1.7],
    [700, 900, 720, 600, 740, 400, 680, 320, 1.6],
    // --- 15 new ribbons ---
    [120, 900, 110, 800, 100, 720, 140, 680, 0.9],
    [260, 900, 250, 820, 240, 760, 280, 730, 0.8],
    [400, 900, 390, 840, 380, 800, 420, 780, 0.8],
    [540, 900, 530, 860, 520, 830, 560, 820, 0.7],
    [620, 900, 610, 870, 600, 850, 640, 840, 0.7],
    [740, 900, 730, 870, 720, 855, 760, 850, 0.7],
    [860, 900, 850, 878, 840, 862, 880, 858, 0.7],
    [330, 900, 310, 740, 290, 580, 350, 480, 1.4],
    [490, 900, 470, 720, 450, 560, 510, 460, 1.3],
    [640, 900, 620, 740, 600, 580, 660, 480, 1.2],
    [820, 900, 800, 740, 780, 560, 840, 460, 1.1],
    [200, 900, 180, 660, 160, 480, 220, 380, 1.5],
    [580, 900, 560, 680, 540, 500, 600, 400, 1.3],
    [960, 900, 940, 780, 920, 660, 980, 580, 1.0],
    [1100, 900, 1080, 850, 1060, 820, 1120, 800, 0.8],
  ];

  // Milestone beads along the success ribbon
  const beads = [
    { cx: 580, cy: 740, label: "Applied" },
    { cx: 572, cy: 530, label: "Recruiter" },
    { cx: 628, cy: 400, label: "Tech Screen" },
    { cx: 760, cy: 286, label: "Interviews" },
    { cx: 980, cy: 120, label: "Final Round" },
    { cx: 1360, cy: 30, label: "Offer! 🎉", offer: true },
  ];

  const successPath =
    "M 600 900 C 580 740, 560 560, 620 420 C 680 280, 820 180, 980 120" +
    " C 1100 72, 1240 52, 1360 30";

  return (
    <Wrap preview={preview}>
      <svg {...SVG}>
        <defs>
          <linearGradient id={gId("v13rej")} x1="0%" y1="100%" x2="0%" y2="0%">
            <stop
              offset="0%"
              stopColor={dark ? "#6366f1" : "#4f46e5"}
              stopOpacity="0.5"
            />
            <stop offset="100%" stopColor={rejectCol} stopOpacity="0.7" />
          </linearGradient>
          <linearGradient id={gId("v13win")} x1="0%" y1="100%" x2="0%" y2="0%">
            <stop
              offset="0%"
              stopColor={dark ? "#6366f1" : "#4f46e5"}
              stopOpacity="0.5"
            />
            <stop
              offset="40%"
              stopColor={dark ? "#a855f7" : "#7c3aed"}
              stopOpacity="0.7"
            />
            <stop offset="100%" stopColor={successCol} stopOpacity="1" />
          </linearGradient>
          {/* Soft bloom for success ribbon */}
          <filter
            id={gId("v13wb")}
            x="-10%"
            y="-10%"
            width="120%"
            height="120%"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="16" />
          </filter>
          <filter id={gId("v13mb")} x="-8%" y="-8%" width="116%" height="116%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter
            id={gId("v13rej")}
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
            id={gId("v13fin")}
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

        {/* Stardust */}
        {DUST_V13.map((d, i) => (
          <circle
            key={i}
            cx={d.x}
            cy={d.y}
            r={d.r}
            fill={dark ? "#818cf8" : "#6366f1"}
            opacity={d.op}
          />
        ))}

        {/* Rejected ribbons */}
        {ribbons.map((seg, i) => {
          const [
            sx = 0,
            sy = 0,
            cp1x = 0,
            cp1y = 0,
            cp2x = 0,
            cp2y = 0,
            ex = 0,
            ey = 0,
            w = 1,
          ] = seg;
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
              <circle
                cx={ex}
                cy={ey}
                r={4}
                fill={rejectCol}
                opacity={ribbonOp * 0.55}
                filter={`url(#${gId("v13rej")})`}
              />
              <circle
                cx={ex}
                cy={ey}
                r={1.8}
                fill={rejectCol}
                opacity={ribbonOp * 1.1}
              />
            </g>
          );
        })}

        {/* Success ribbon — 3 glow layers */}
        <path
          d={successPath}
          stroke={successCol}
          strokeWidth="24"
          fill="none"
          opacity={0.04}
          filter={`url(#${gId("v13wb")})`}
        />
        <path
          d={successPath}
          stroke={`url(#${gId("v13win")})`}
          strokeWidth="7"
          fill="none"
          opacity={0.12}
          filter={`url(#${gId("v13mb")})`}
        />
        <path
          d={successPath}
          stroke={`url(#${gId("v13win")})`}
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          opacity={successOp}
        />

        {/* Milestone beads along winning ribbon */}
        {beads.map(({ cx, cy, label, offer: isOffer }, i) => {
          const prox = i / (beads.length - 1);
          return (
            <g key={i} opacity={0.3 + prox * 0.6}>
              <circle
                cx={cx}
                cy={cy}
                r={isOffer ? 10 : 6}
                fill={isOffer ? successCol : dark ? "#a855f7" : "#7c3aed"}
                opacity={0.15}
                filter={isOffer ? `url(#${gId("v13fin")})` : undefined}
              />
              <circle
                cx={cx}
                cy={cy}
                r={isOffer ? 5 : 3}
                fill={isOffer ? successCol : dark ? "#a855f7" : "#7c3aed"}
                filter={isOffer ? `url(#${gId("v13fin")})` : undefined}
              />
              <text
                x={cx + 9}
                y={cy - 5}
                fontSize={isOffer ? 10 : 8.5}
                fill={isOffer ? successCol : dark ? "#e2e8f0" : "#1e1b4b"}
                fontFamily="monospace"
                fontWeight={isOffer ? "bold" : "normal"}
                opacity={0.82}
              >
                {label}
              </text>
            </g>
          );
        })}

        <text
          x={40}
          y={878}
          fontSize="9"
          fill={dark ? "white" : "#0f172a"}
          opacity={0.1}
          fontFamily="monospace"
        >
          Every line is an attempt. One is the answer.
        </text>
      </svg>
    </Wrap>
  );
}

// ─── V8 — Stepping Stones  ░░ One Step at a Time ────────────────────────────
//
// Stepping stones arc from the bottom-left toward a glowing pad in the top-right,
// with footprints walking between them. The stones brighten and the gaps fill
// with more footprints as the goal nears. Goal-agnostic: cross any distance one
// steady step at a time.
//
// Style: calm, grounded, meditative.

export function BackgroundV4({ preview = false }: { preview?: boolean }) {
  const dark = useDark();
  const gId = (s: string) => (preview ? `${s}P` : s);

  const c = dark
    ? {
        stone: "#6366f1",
        hi: "#a5b4fc",
        foot: "#c7d2fe",
        fin: "#22c55e",
        finHi: "#bbf7d0",
        ripple: "#818cf8",
      }
    : {
        stone: "#6366f1",
        hi: "#c7d2fe",
        foot: "#4338ca",
        fin: "#15803d",
        finHi: "#dcfce7",
        ripple: "#6366f1",
      };

  const stones = [
    { x: 150, y: 815 },
    { x: 320, y: 768 },
    { x: 495, y: 728 },
    { x: 660, y: 662 },
    { x: 820, y: 596 },
    { x: 975, y: 512 },
    { x: 1120, y: 420 },
    { x: 1255, y: 312 },
    { x: 1340, y: 175 }, // goal pad
  ];

  // Footprints between consecutive stones (deterministic, denser near the goal)
  interface Foot {
    x: number;
    y: number;
    rot: number;
    norm: number;
  }
  const feet: Foot[] = [];
  for (let i = 0; i < stones.length - 1; i++) {
    const a = stones[i];
    const b = stones[i + 1];
    if (!a || !b) continue;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const ux = dx / len;
    const uy = dy / len;
    const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
    const count = i < 3 ? 2 : 3;
    for (let k = 1; k <= count; k++) {
      const t = k / (count + 1);
      const sx = a.x + dx * t;
      const sy = a.y + dy * t;
      const side = k % 2 === 0 ? 1 : -1;
      const off = 9;
      const fx = sx - uy * off * side;
      const fy = sy + ux * off * side;
      feet.push({
        x: fx,
        y: fy,
        rot: ang,
        norm: (fx / 1440 + (1 - fy / 900)) / 2,
      });
    }
  }

  const goal = stones[stones.length - 1] ?? { x: 1340, y: 175 };

  return (
    <Wrap preview={preview}>
      <svg {...SVG}>
        <defs>
          <radialGradient id={gId("v16bg")} cx="85%" cy="10%" r="80%">
            <stop
              offset="0%"
              stopColor={dark ? "#1e1b4b" : "#c7d2fe"}
              stopOpacity={dark ? 0.45 : 0.35}
            />
            <stop
              offset="100%"
              stopColor={dark ? "#000" : "#fff"}
              stopOpacity="0"
            />
          </radialGradient>
          <filter
            id={gId("v16fin")}
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

        <rect width="1440" height="900" fill={`url(#${gId("v16bg")})`} />

        {/* Footprints between stones */}
        {feet.map((f, i) => {
          const op = dark ? 0.08 + f.norm * 0.16 : 0.06 + f.norm * 0.12;
          return (
            <g
              key={`ft${i}`}
              transform={`rotate(${f.rot.toFixed(1)} ${f.x.toFixed(1)} ${f.y.toFixed(1)})`}
              opacity={op}
            >
              <ellipse cx={f.x} cy={f.y} rx={6} ry={3.4} fill={c.foot} />
              <ellipse cx={f.x - 7} cy={f.y} rx={2} ry={2.4} fill={c.foot} />
            </g>
          );
        })}

        {/* Stones */}
        {stones.map(({ x, y }, i) => {
          const isGoal = i === stones.length - 1;
          if (isGoal) return null; // goal pad drawn separately below
          const norm = (x / 1440 + (1 - y / 900)) / 2;
          const rx = 24 + norm * 6;
          const ry = rx * 0.52;
          const op = dark ? 0.14 + norm * 0.26 : 0.1 + norm * 0.2;
          return (
            <g key={`st${i}`}>
              {(i === 1 || i === 5) && (
                <ellipse
                  cx={x}
                  cy={y}
                  rx={rx + 12}
                  ry={ry + 7}
                  fill="none"
                  stroke={c.ripple}
                  strokeWidth="1"
                  opacity={op * 0.3}
                />
              )}
              <ellipse
                cx={x}
                cy={y}
                rx={rx}
                ry={ry}
                fill={c.stone}
                opacity={op}
              />
              <ellipse
                cx={x}
                cy={y - ry * 0.32}
                rx={rx * 0.62}
                ry={ry * 0.4}
                fill={c.hi}
                opacity={op * 0.6}
              />
            </g>
          );
        })}

        {/* Goal pad: glowing green stepping stone */}
        <g filter={`url(#${gId("v16fin")})`}>
          <ellipse
            cx={goal.x}
            cy={goal.y}
            rx={46}
            ry={24}
            fill="none"
            stroke={c.fin}
            strokeWidth="1"
            opacity={0.25}
          />
          <ellipse
            cx={goal.x}
            cy={goal.y}
            rx={34}
            ry={18}
            fill={c.fin}
            opacity={0.78}
          />
          <ellipse
            cx={goal.x}
            cy={goal.y - 6}
            rx={20}
            ry={8}
            fill={c.finHi}
            opacity={0.5}
          />
        </g>
        <text
          x={goal.x}
          y={goal.y + 44}
          textAnchor="middle"
          fontSize="12"
          fill={dark ? "white" : "#0f172a"}
          opacity={0.7}
          fontFamily="monospace"
          fontWeight="bold"
        >
          Goal! 🎯
        </text>

        {/* Footer */}
        <text
          x={40}
          y={872}
          fontSize="10"
          fill={dark ? "white" : "#0f172a"}
          opacity={dark ? 0.12 : 0.1}
          fontFamily="monospace"
        >
          One step at a time.
        </text>
      </svg>
    </Wrap>
  );
}

// ─── V5 — Momentum Grid  ░░ Show Up Every Day ────────────────────────────────
//
// A streak / contribution grid — every cell is a day. Cells stay dim until you
// show up, then warm and brighten. A diagonal band of activity climbs from the
// bottom-left toward the top-right, where the final cell glows green: the goal
// reached. Goal-agnostic — consistency on any journey, one logged day at a time.
//
// Style: data-driven, satisfying, calm.

export function BackgroundV5({ preview = false }: { preview?: boolean }) {
  const dark = useDark();
  const gId = (s: string) => (preview ? `${s}P` : s);

  const lowCol = dark ? "148,163,184" : "100,116,139"; // slate
  const midCol = dark ? "#6366f1" : "#4f46e5"; // indigo
  const hiCol = dark ? "#a855f7" : "#7c3aed"; // violet
  const finCol = dark ? "#22c55e" : "#15803d"; // green

  const pitch = 42;
  const cell = 30;
  const cols = Math.ceil(1440 / pitch);
  const rows = Math.ceil(900 / pitch);

  // Deterministic per-cell "activity" 0..1 (no randomness — SSR-safe)
  function activity(col: number, row: number) {
    const cx = col * pitch + cell / 2;
    const cy = row * pitch + cell / 2;
    const norm = (cx / 1440 + (1 - cy / 900)) / 2; // proximity to top-right
    const diag = 1 - Math.abs(cx / 1440 - (1 - cy / 900)); // 1 on BL→TR diagonal
    const band = Math.max(0, diag - 0.55) / 0.45; // streak band, 0..1
    const noise = Math.sin(col * 12.9898 + row * 78.233) * 0.5 + 0.5;
    return Math.min(1, norm * 0.55 + band * 0.5 + noise * 0.18 * norm);
  }

  interface Cell {
    x: number;
    y: number;
    a: number;
  }
  const cells: Cell[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      cells.push({ x: col * pitch, y: row * pitch, a: activity(col, row) });
    }
  }

  // Goal cell: top-right, the streak's payoff
  const goal = { x: (cols - 2) * pitch, y: pitch };

  return (
    <Wrap preview={preview}>
      <svg {...SVG}>
        <defs>
          <radialGradient id={gId("v5bg")} cx="88%" cy="8%" r="80%">
            <stop
              offset="0%"
              stopColor={dark ? "#1e1b4b" : "#c7d2fe"}
              stopOpacity={dark ? 0.4 : 0.3}
            />
            <stop
              offset="100%"
              stopColor={dark ? "#000" : "#fff"}
              stopOpacity="0"
            />
          </radialGradient>
          <filter
            id={gId("v5fin")}
            x="-100%"
            y="-100%"
            width="300%"
            height="300%"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width="1440" height="900" fill={`url(#${gId("v5bg")})`} />

        {cells.map(({ x, y, a }, i) => {
          let fill: string;
          let op: number;
          if (a < 0.25) {
            fill = `rgb(${lowCol})`;
            op = dark ? 0.035 + a * 0.12 : 0.03 + a * 0.1;
          } else if (a < 0.6) {
            fill = midCol;
            op = dark ? 0.08 + a * 0.18 : 0.06 + a * 0.14;
          } else {
            fill = hiCol;
            op = dark ? 0.12 + a * 0.24 : 0.1 + a * 0.2;
          }
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={cell}
              height={cell}
              rx={6}
              fill={fill}
              opacity={Math.min(op, dark ? 0.45 : 0.38)}
            />
          );
        })}

        {/* Goal cell — glowing green */}
        <g filter={`url(#${gId("v5fin")})`}>
          <rect
            x={goal.x - 4}
            y={goal.y - 4}
            width={cell + 8}
            height={cell + 8}
            rx={9}
            fill="none"
            stroke={finCol}
            strokeWidth="1"
            opacity={0.4}
          />
          <rect
            x={goal.x}
            y={goal.y}
            width={cell}
            height={cell}
            rx={6}
            fill={finCol}
            opacity={0.85}
          />
        </g>
        <text
          x={goal.x + cell / 2}
          y={goal.y + cell + 18}
          textAnchor="middle"
          fontSize="12"
          fill={dark ? "white" : "#0f172a"}
          opacity={0.7}
          fontFamily="monospace"
          fontWeight="bold"
        >
          Goal! 🎯
        </text>

        {/* Footer */}
        <text
          x={40}
          y={872}
          fontSize="10"
          fill={dark ? "white" : "#0f172a"}
          opacity={dark ? 0.12 : 0.1}
          fontFamily="monospace"
        >
          Show up. Snap. Repeat.
        </text>
      </svg>
    </Wrap>
  );
}

// ─── V6 — Growing Vine  ░░ Plant a Goal, Watch It Grow ───────────────────────
//
// A single vine grows from a root in the bottom-left, winding up and to the
// right, sprouting leaves that mature from indigo to green, and finally
// blossoming into a glowing flower — the goal. Goal-agnostic: plant any goal,
// tend it daily, and watch it grow.
//
// Style: organic, hopeful, alive.

export function BackgroundV6({ preview = false }: { preview?: boolean }) {
  const dark = useDark();
  const gId = (s: string) => (preview ? `${s}P` : s);

  const c = dark
    ? { p1: "#4f46e5", p2: "#7c3aed", p3: "#22c55e", finCenter: "#bbf7d0" }
    : { p1: "#3730a3", p2: "#6d28d9", p3: "#15803d", finCenter: "#dcfce7" };

  const leafLow = dark ? "#4f46e5" : "#4338ca";
  const leafMid = dark ? "#7c3aed" : "#6d28d9";
  const leafHigh = dark ? "#22c55e" : "#15803d";

  const stemOp = dark ? 0.38 : 0.26;
  const glowOp = dark ? 0.12 : 0.07;

  // Main stem (deterministic, bottom-left → top-right)
  const stemD =
    "M 180 880 C 250 780, 230 720, 320 660 " +
    "C 410 600, 470 600, 520 520 " +
    "C 570 440, 560 400, 660 350 " +
    "C 760 300, 820 320, 900 270 " +
    "C 980 220, 1010 220, 1080 190 " +
    "C 1150 162, 1200 160, 1240 140";

  // Leaf builder — almond shape at (x,y), pointing along angleDeg
  function leaf(
    x: number,
    y: number,
    angleDeg: number,
    len: number,
    w: number,
  ) {
    const a = (angleDeg * Math.PI) / 180;
    const tx = x + len * Math.cos(a);
    const ty = y + len * Math.sin(a);
    const mx = (x + tx) / 2;
    const my = (y + ty) / 2;
    const px = -Math.sin(a) * w;
    const py = Math.cos(a) * w;
    return `M ${x.toFixed(1)} ${y.toFixed(1)} Q ${(mx + px).toFixed(1)} ${(my + py).toFixed(1)} ${tx.toFixed(1)} ${ty.toFixed(1)} Q ${(mx - px).toFixed(1)} ${(my - py).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)} Z`;
  }

  // Leaves along the stem: [anchorX, anchorY, outwardAngleDeg, len, width]
  const leaves: [number, number, number, number, number][] = [
    [300, 678, 205, 46, 15],
    [352, 618, 338, 42, 13],
    [498, 540, 208, 44, 14],
    [532, 470, 350, 40, 12],
    [624, 384, 206, 42, 13],
    [684, 348, 344, 38, 12],
    [840, 296, 210, 40, 12],
    [898, 262, 340, 36, 11],
    [1024, 212, 212, 36, 11],
    [1086, 190, 338, 32, 10],
    [1170, 162, 215, 28, 9],
  ];

  return (
    <Wrap preview={preview}>
      <svg {...SVG}>
        <defs>
          <linearGradient id={gId("v6g")} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={c.p1} />
            <stop offset="55%" stopColor={c.p2} />
            <stop offset="100%" stopColor={c.p3} />
          </linearGradient>
          <radialGradient id={gId("v6bg")} cx="85%" cy="10%" r="80%">
            <stop
              offset="0%"
              stopColor={dark ? "#1e1b4b" : "#c7d2fe"}
              stopOpacity={dark ? 0.42 : 0.32}
            />
            <stop
              offset="100%"
              stopColor={dark ? "#000" : "#fff"}
              stopOpacity="0"
            />
          </radialGradient>
          <filter
            id={gId("v6blur")}
            x="-10%"
            y="-10%"
            width="120%"
            height="120%"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" />
          </filter>
          <filter
            id={gId("v6fin")}
            x="-120%"
            y="-120%"
            width="340%"
            height="340%"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width="1440" height="900" fill={`url(#${gId("v6bg")})`} />

        {/* Stem glow */}
        <path
          d={stemD}
          fill="none"
          stroke={`url(#${gId("v6g")})`}
          strokeWidth="8"
          strokeLinecap="round"
          opacity={glowOp}
          filter={`url(#${gId("v6blur")})`}
        />
        {/* Stem */}
        <path
          d={stemD}
          fill="none"
          stroke={`url(#${gId("v6g")})`}
          strokeWidth="3"
          strokeLinecap="round"
          opacity={stemOp}
        />

        {/* Leaves */}
        {leaves.map(([x, y, ang, len, w], i) => {
          const norm = (x / 1440 + (1 - y / 900)) / 2;
          const col = norm > 0.66 ? leafHigh : norm > 0.42 ? leafMid : leafLow;
          const op = Math.min(
            dark ? 0.16 + norm * 0.22 : 0.11 + norm * 0.18,
            dark ? 0.46 : 0.4,
          );
          const ar = (ang * Math.PI) / 180;
          return (
            <g key={`lf${i}`}>
              <path d={leaf(x, y, ang, len, w)} fill={col} opacity={op} />
              {/* central vein */}
              <line
                x1={x}
                y1={y}
                x2={x + len * Math.cos(ar)}
                y2={y + len * Math.sin(ar)}
                stroke={dark ? "#0c0a1e" : "#ffffff"}
                strokeWidth="0.8"
                opacity={op * 0.4}
              />
            </g>
          );
        })}

        {/* Bloom — the goal */}
        <g filter={`url(#${gId("v6fin")})`}>
          {Array.from({ length: 6 }, (_, k) => {
            const a = (k / 6) * Math.PI * 2;
            const bx = 1240 + Math.cos(a) * 16;
            const by = 140 + Math.sin(a) * 16;
            return (
              <ellipse
                key={`pt${k}`}
                cx={bx}
                cy={by}
                rx={14}
                ry={7}
                fill={c.p3}
                opacity={0.55}
                transform={`rotate(${((a * 180) / Math.PI).toFixed(1)} ${bx} ${by})`}
              />
            );
          })}
          <circle cx={1240} cy={140} r={11} fill={c.p3} opacity={0.85} />
          <circle cx={1240} cy={140} r={5} fill={c.finCenter} opacity={0.7} />
        </g>
        <text
          x={1222}
          y={146}
          textAnchor="end"
          fontSize="12"
          fill={dark ? "white" : "#0f172a"}
          opacity={0.72}
          fontFamily="monospace"
          fontWeight="bold"
        >
          Goal! 🎯
        </text>

        {/* Footer */}
        <text
          x={40}
          y={872}
          fontSize="10"
          fill={dark ? "white" : "#0f172a"}
          opacity={dark ? 0.12 : 0.1}
          fontFamily="monospace"
        >
          Plant it. Tend it. Grow.
        </text>
      </svg>
    </Wrap>
  );
}
