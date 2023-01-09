import { writable } from "svelte/store";

const exampleTimelineLog = [
  {
    start: 1673154788268,
    end: 1673155334775,
    isConsequent: false,
    dayLog: [
      {
        activityName: "programming",
        activitySubcategory: "sveltekit",
        description: "developing timetrack",
        start: 1673155172397,
        end: 1673155219226,
      }
    ]
  }
]

// timelineLog is an array of days that make up the history
export const timelineLog = writable(exampleTimelineLog);
