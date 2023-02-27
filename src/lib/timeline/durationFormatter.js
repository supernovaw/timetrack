// Convert duration in milliseconds into a human-readable format (e.g. "27.5 minutes")
export default function formatDuration(millis) {
  if (typeof millis !== "number") throw new Error("expected a number, got", millis);
  if (millis < 0) throw new Error("negative duration: " + millis);

  if (millis < 1000) return millis.toFixed(0) + " ms";

  const sec = millis / 1000;
  if (sec < 60) return plural(sec.toFixed(1), "second");

  const min = sec / 60;
  if (min < 60) return plural(min.toFixed(1), "minute");

  const hr = min / 60;
  if (hr < 24) return plural(Math.floor(hr), "hour") + " " + plural(Math.floor(min % 60), "minute");

  const days = hr / 24;
  return plural(days.toFixed(1), "day");
}

// plural(1, "day") === "1 day"
// plural(1.2, "hour") === "1.2 hours"
// plural("1.00", "minute") === "1 minute"
export function plural(number, singular, plural = singular + "s") {
  if (+number === 1) return "1 " + singular;
  return number + " " + plural;
}
