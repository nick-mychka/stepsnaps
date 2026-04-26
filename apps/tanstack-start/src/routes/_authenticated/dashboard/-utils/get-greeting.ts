const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

function hash(input: string) {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function dateKey(now: Date) {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function variantsForHour(hour: number, name: string, weekday: string) {
  if (hour >= 5 && hour < 12) {
    return [
      `Good morning, ${name}`,
      `Welcome back, ${name}`,
      `Hi, ${name}`,
      `Happy ${weekday}, ${name}`,
    ];
  }
  if (hour >= 12 && hour < 18) {
    return [
      `Good afternoon, ${name}`,
      `Welcome back, ${name}`,
      `Hi, ${name}`,
      `Happy ${weekday}, ${name}`,
    ];
  }
  if (hour >= 18 && hour < 23) {
    return [`Good evening, ${name}`, `Welcome back, ${name}`, `Hi, ${name}`];
  }
  return [
    `Still up, ${name}?`,
    `Burning the midnight oil, ${name}?`,
    `Welcome back, ${name}`,
  ];
}

export function getGreeting(name: string, userId?: string) {
  const firstName = name.trim().split(" ")[0];
  if (!firstName) return "Welcome back";

  const now = new Date();
  const weekday = WEEKDAYS[now.getDay()] ?? "Today";
  const variants = variantsForHour(now.getHours(), firstName, weekday);
  const seed = `${dateKey(now)}-${userId ?? ""}`;

  return variants[hash(seed) % variants.length] ?? `Welcome back, ${firstName}`;
}
