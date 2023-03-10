import moment from "moment";
import timeline from "./timeline";

// As 'phase' goes from 0 to 1, returned value goes from 'numberFrom' to 'numberTo'
export function tweenValue(numberFrom, numberTo, phase) {
  return numberFrom * (1 - phase) + numberTo * phase;
}

export function timeToPos(t, range, width) {
  const f = (t - range[0]) / (range[1] - range[0]);
  return f * width;
}

export function posToTime(x, range, width) {
  const f = x / width;
  return range[0] + f * (range[1] - range[0]);
}

export function line(g, x1, y1, x2, y2, width) {
  let widthOld = g.lineWidth;
  if (width) g.lineWidth = width;

  g.beginPath();
  g.moveTo(x1, y1);
  g.lineTo(x2, y2);
  g.stroke();

  if (width) g.lineWidth = widthOld;
}

// Returns index of the day to which the timestamp belongs
export function findDayIndex(timelineLog, timestamp) {
  const now = +new Date();
  for (let i = timelineLog.length - 1; i >= 0; i--) {
    const day = timelineLog[i];
    const start = day.start;
    const end = day.end || now;
    if (start > timestamp) continue;
    if (end > timestamp) return i;
    return -1;
  }
  return -1;
}

// Returns index of the task in the day to which the timestamp belongs
export function findTaskIndex(day, timestamp) {
  if (timestamp < day.start) return -1;
  if (day.end && day.end < timestamp) return -1;

  const now = +new Date();
  for (let i = 0; i < day.dayLog.length; i++) {
    const task = day.dayLog[i];
    const start = task.start;
    const end = task.end || now;
    if (end < timestamp) continue;
    if (start < timestamp) return i;
    return -1;
  }
  return -1;
}

// Determines, whether a new item with given start and end would overlap with other items
// Works on both days and tasks. Assumes proper array order, allows for unfinished items.
export function hasOverlap(array, start, end) {
  for (const item of array)
    if (start <= item.end && end >= (item.start || +new Date()))
      return true;
  return false;
}

export const endOf = { minute: 0 };
if (typeof window !== "undefined")
  updateEndOfMinute(true);
function updateEndOfMinute(firstRun) {
  endOf.minute = moment().endOf("minute").unix() * 1000 + 1000;
  const millisLeftInMinute = endOf.minute - +new Date();
  setTimeout(updateEndOfMinute, millisLeftInMinute);
  if (!firstRun) timeline.repaint();
}
