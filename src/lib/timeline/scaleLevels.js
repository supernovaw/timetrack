import moment from "moment";

const startOfWeek = 1; // 0=Sunday 1=Monday etc

export const scaleLevels = [
  {
    name: "1-s",
    unitSizeS: 1,
    format: "HH:mm:ss",
    nextMoment: t => nextPeriod(t, 1_000)
  }, {
    name: "10-s",
    unitSizeS: 10,
    format: "HH:mm:ss",
    nextMoment: t => nextPeriod(t, 10_000)
  }, {
    name: "1-min",
    unitSizeS: 60,
    format: "HH:mm",
    nextMoment: t => nextPeriod(t, 60_000)
  }, {
    name: "5-min",
    unitSizeS: 5 * 60,
    format: "HH:mm",
    nextMoment: t => nextPeriod(t, 300_000)
  }, {
    name: "15-min",
    unitSizeS: 15 * 60,
    format: "HH:mm",
    nextMoment: t => nextPeriod(t, 900_000)
  }, {
    name: "1-hr",
    unitSizeS: 3600,
    format: "HH:mm",
    nextMoment: t => nextUnit(t, "hour")
  }, {
    name: "6-hr",
    unitSizeS: 6 * 3600,
    format: "MM/DD HH:mm",
    nextMoment: t => nextUnits(t, "hour", 6)
  }, {
    name: "1-d",
    unitSizeS: 86_400,
    format: "MM/DD ddd",
    nextMoment: t => nextUnit(t, "day")
  }, {
    name: "1-w",
    unitSizeS: 7 * 86_400,
    format: "MM/DD",
    nextMoment: t => moment(t)
      .subtract(startOfWeek, "day") // Make sure we start in the beginning of the week whose end we're looking for
      .startOf("week") // Go to the beginning of Sunday-based week
      .add(7 + startOfWeek, "day") // Go to the end of the Sunday-based week and go to the preferred week start day
      .unix() * 1000
  }, {
    name: "1-m",
    unitSizeS: 30 * 86_400,
    format: "YYYY MMM",
    nextMoment: t => nextUnit(t, "month")
  }, {
    name: "1-y",
    unitSizeS: 365 * 86_400,
    format: "YYYY",
    nextMoment: t => nextUnit(t, "year")
  }, {
    name: "10-y",
    unitSizeS: 10 * 365.2 * 86_400,
    format: "YYYY['s]",
    nextMoment: t => nextUnits(t, "year", 10)
  }
];

// Find the biggest scale whose single unit fits within 750px
export function findMatchingLevel(spanMs, width) {
  let frameSecs = spanMs / 1000 * 750 / width;
  let index = scaleLevels.findIndex(lvl => lvl.unitSizeS > frameSecs) - 1;
  if (index === -1) index = 0; // we're looking at seconds or less
  if (index === -2) index = scaleLevels.length - 1; // we're looking at decades or more
  return index;
}

// Below are functions used when rendering timeline markers, that take a
// timestamp (e.g. Jan 08 02:26) and a unit of time (e.g. 1 day) and return
// the next marker after that timestamp (Jan 09 00:00 for this example).
function nextPeriod(t, period) { // Time unit is in milliseconds (e.g. 60000 for minutes)
  return t - t % period + period;
}
function nextUnit(t, unit) { // Time unit is a moment.js specific string (e.g. "month")
  const m = moment(t);
  m.startOf(unit);
  m.add(1, unit);
  return m.unix() * 1000;
}
function nextUnits(t, unit, unitsNumber) { // Time unit is a number of moment.js units of time (e.g. 6 "hours")
  const m = moment(t);
  const unitValue = m.get(unit);
  m.startOf(unit);
  // For example, if the unit is 6 hours, 13:30 will become 18:00 (13 - (13 % 6) + 6 = 18)
  m.set(unit, unitValue - unitValue % unitsNumber + unitsNumber);
  return m.unix() * 1000;
}
