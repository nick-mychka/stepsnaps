export function getGreeting(name: string): string {
  const hour = new Date().getHours();
  const firstName = name.split(" ")[0];
  if (!firstName) return "Welcome back 👋";
  if (hour >= 5 && hour < 12) return `Good Morning, ${firstName} 🌤️`;
  if (hour >= 12 && hour < 18) return `Good Afternoon, ${firstName} ☀️`;
  return `Good Evening, ${firstName} 🌙`;
}
