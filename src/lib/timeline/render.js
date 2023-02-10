import renderEmptyTimeline from "./renderEmptyTimeline";
import renderTimelineLog from "./renderTimelineLog";

export default function render(g, w, h) {
  g.font = "11px 'SF Mono'";
  const range = this.calcRange();
  renderEmptyTimeline(g, w, h, range, this.mouse.x);
  renderTimelineLog(g, w, h, range, this.mouse.x);
  renderMisc(g, w, h, this);
}

function renderMisc(g, w, h, timeline) {
  if (timeline.timestampPicker) {
    const { text } = timeline.timestampPicker;
    const { width: textW, actualBoundingBoxAscent: textH } = g.measureText(text);
    g.fillText(text, (w - textW) / 2, 10 + textH);
  }
}
