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
