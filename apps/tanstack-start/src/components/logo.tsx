const chars = [
  { char: "S", color: "var(--logo-1)" },
  { char: "t", color: "var(--logo-2)" },
  { char: "e", color: "var(--logo-3)" },
  { char: "p", color: "var(--logo-4)" },
  { char: "S", color: "var(--logo-5)" },
  { char: "n", color: "var(--logo-6)" },
  { char: "a", color: "var(--logo-7)" },
  { char: "p", color: "var(--logo-8)" },
  { char: "s", color: "var(--logo-9)" },
];

export function Logo({ className }: { className?: string }) {
  return (
    <span className={className} aria-label="StepSnaps">
      {chars.map((c, i) => (
        <span key={i} style={{ color: c.color }}>
          {c.char}
        </span>
      ))}
    </span>
  );
}
