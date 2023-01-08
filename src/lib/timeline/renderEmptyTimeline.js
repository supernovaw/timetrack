import moment from "moment";
import { baselineY } from "./timeline";
import { findMatchingLevel, scaleLevels } from "./scaleLevels";
import { timeToPos, posToTime, line } from "./utilities";

// Render baseline, markers with time labels, cursor, cursor time (bottom left)
export default function renderEmptyTimeline(g, w, h, range, mouseX) { // graphics (context), width, height, range, mouse X
  const rangeSpan = range[1] - range[0];
  const mouseT = posToTime(mouseX, range, w);
  const levelIndex = findMatchingLevel(rangeSpan, w);
  const mainLevel = scaleLevels[levelIndex];
  const secondaryLevel = scaleLevels[levelIndex - 1];
  g.strokeStyle = "#ffffff";
  g.fillStyle = "#ffffff";

  line(g, 0, baselineY, w, baselineY); // Main line

  // Highlight current day
  const dayStart = moment().startOf("day");
  const dayEnd = moment().startOf("day").add(1, "day");
  const dayStartX = timeToPos(dayStart, range, w);
  const dayEndX = timeToPos(dayEnd, range, w);
  line(g, dayStartX - 1, baselineY, dayEndX + 1, baselineY, 2);

  // Main level markers (with labels)
  // Start at range[0] - rangeSpan * 0.1 to prevent labels on the left from abruptly disappearing
  for (let t = range[0] - rangeSpan * 0.1, limit = 100; t < range[1] && limit > 0; limit--) {
    t = mainLevel.nextMoment(t);
    const x = timeToPos(t, range, w);
    line(g, x, baselineY - 4, x, baselineY + 4);
    g.fillText(moment(t).format(mainLevel.format), x, baselineY - 5);
  }

  // Secondary level markers (smaller, more numerous)
  if (secondaryLevel) {
    for (let t = range[0], limit = 1000; t < range[1] && limit > 0; limit--) {
      t = secondaryLevel.nextMoment(t);
      const x = timeToPos(t, range, w);
      line(g, x, baselineY - 2, x, baselineY + 2);
    }
  }

  // Cursor timestamp
  line(g, mouseX, baselineY - 10, mouseX, baselineY); // marker
  g.fillText(moment(mouseT).format("YYYY-MM-DD HH:mm:ss ZZ (ddd)"), 5, h - 5);
}
