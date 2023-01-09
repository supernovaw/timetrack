import { timelineLog as timelineLogStore } from "../state/index";
import { baselineY } from "./timeline";
import { timeToPos, line } from "./utilities";
import formatDuration from "./durationFormatter";

let timelineLogValue;
timelineLogStore.subscribe(v => timelineLogValue = v);

export default function renderTimelineLog(g, w, h, range, mouseX) {
  let hoveredActivity = null;

  // Render each day
  for (const day of timelineLogValue) {
    if (day.end < range[0]) continue;
    if (day.start > range[1]) break;

    const dayStartX = timeToPos(day.start, range, w);
    const dayEndX = timeToPos(day.end, range, w);
    g.strokeStyle = "#777";
    line(g, dayStartX, baselineY + 5.5, dayEndX, baselineY + 5.5, 3);

    // Render each activity of the day
    for (const activity of day.dayLog) {
      const activityStartX = timeToPos(activity.start, range, w);
      const activityEndX = timeToPos(activity.end, range, w);
      g.strokeStyle = "#fff";
      line(g, activityStartX, baselineY + 8.5, activityEndX, baselineY + 8.5, 3);

      // If we encountered the hovered activity, save it
      if (hoveredActivity === null && mouseX > activityStartX && mouseX < activityEndX) {
        hoveredActivity = activity;
      }
    }
  }

  // Render the status string for the hovered activity
  if (hoveredActivity !== null) {
    const act = hoveredActivity;

    const statusString = act.activityName
      + (act.activitySubcategory ? ` (${act.activitySubcategory})` : "")
      + (act.description ? `: ${act.description}` : "") //   e.g. ": developing timetrack"
      + " (" + formatDuration(act.end - act.start) + ")"; // e.g. " (46.8 minutes)"

    g.fillText(statusString, 5, h - 20);
  }
}
