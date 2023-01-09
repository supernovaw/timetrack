import renderEmptyTimeline from "./renderEmptyTimeline";
import renderTimelineLog from "./renderTimelineLog";

export default function render(g, w, h) {
  g.font = "11px 'SF Mono'";
  const range = this.calcRange();
  renderEmptyTimeline(g, w, h, range, this.mouse.x);
  renderTimelineLog(g, w, h, range, this.mouse.x);
}
