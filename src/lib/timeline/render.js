import renderEmptyTimeline from "./renderEmptyTimeline";

export default function render(g, w, h) {
  g.font = "12px 'SF Mono'";
  const range = this.calcRange();
  renderEmptyTimeline(g, w, h, range, this.mouse.x);
}
