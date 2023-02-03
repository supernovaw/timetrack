import render from "./render";
import { tweenValue } from "./utilities";
import { timelineLog } from "$lib/state";

class Timeline {
  canvas;
  mouse = { x: 0, y: 0 };
  range = getInitialRange();

  rangeAnimation = {
    duration: 300,
    lastRange: null,
    timestamp: 0,
    expired: true,
  };

  // If range has been changed in the last 'rangeAnimation.duration' milliseconds, smoothly
  // animate from the previous range to the new; otherwise just return 'this.range'
  calcRange() {
    if (this.rangeAnimation.expired) return this.range;
    const elapsedTime = performance.now() - this.rangeAnimation.timestamp;
    const t = elapsedTime / this.rangeAnimation.duration; // 0 is just began animating, 1 is finished animating

    if (t > 1) {
      this.rangeAnimation.expired = true;
      return this.range;
    }

    const rFrom = this.rangeAnimation.lastRange;
    const rTo = this.range;
    const easedPhase = animationEase(t);
    return [
      tweenValue(rFrom[0], rTo[0], easedPhase), // range start ([0]) (From old To new)
      tweenValue(rFrom[1], rTo[1], easedPhase) //  range end ([1])   (From old To new)
    ];
  }

  paint() {
    const g = this.canvas.getContext("2d");
    const dpr = window.devicePixelRatio;
    g.resetTransform();
    g.scale(dpr, dpr);

    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    g.clearRect(0, 0, w, h);
    render.call(this, g, w, h);
    if (!this.rangeAnimation.expired) this.repaint();
  }
  boundPaint = this.paint.bind(this);

  repaint() {
    requestAnimationFrame(this.boundPaint);
  }

  onResize() {
    // set the actual rendered pixel dimensions on canvas and repaint
    const dpr = window.devicePixelRatio;
    this.canvas.width = this.canvas.clientWidth * dpr;
    this.canvas.height = this.canvas.clientHeight * dpr;
    this.repaint();
  }

  onMouseMove(e) {
    this.mouse.x = e.offsetX;
    this.mouse.y = e.offsetY;
    this.repaint();
  }

  onWheel(e) {
    if (e.ctrlKey) return;
    e.preventDefault();

    const currentRange = this.calcRange();
    const currentRangeSpan = currentRange[1] - currentRange[0];
    // 'zoomFactor' greater than 1 corresponds to zooming out, less than 1 to zooming in
    const zoomFactor = Math.exp(e.deltaY / 200);
    const newRangeSpan = currentRangeSpan * zoomFactor;

    // 'mousePosFraction' of 0 means left end of canvas, of 1 means right end of canvas
    const mousePosFraction = this.mouse.x / this.canvas.clientWidth;
    // 'mouseValue' is the timestamp the mouse is pointing to
    const mouseValue = tweenValue(...currentRange, mousePosFraction);

    const newRangeStart = mouseValue - newRangeSpan * mousePosFraction;
    const newRangeEnd = mouseValue + newRangeSpan * (1 - mousePosFraction);

    this.rangeAnimation.timestamp = performance.now();
    this.rangeAnimation.expired = false;
    this.rangeAnimation.lastRange = currentRange;
    this.range = [newRangeStart, newRangeEnd];

    this.mouse.x = e.offsetX;
    this.mouse.y = e.offsetY;
    this.repaint();
  }
}

const singleton = new Timeline();
if (typeof window !== "undefined") {
  timelineLog.subscribe(() => singleton.repaint());
}

function animationEase(phase) { // used for animating range
  return 1 - Math.pow(1 - phase, 3);
}

function getInitialRange() {
  const now = +new Date();
  const span = 24 * 3600_000; // 24 hours
  return [
    now - span / 2,
    now + span / 2
  ];
}

export const baselineY = 150;
export default singleton;

