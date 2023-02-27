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
        tags: ["self-improvement", "hobby"],
        start: 1673155172397,
        end: 1673155219226,
      }
    ]
  }
]

const exampleActivities = {
  list: [
    {
      name: "programming",
      subcategories: ["sveltekit", "react", "java", "c"],
      defaultTags: ["hobby"],
    }, {
      name: "reading",
      subcategories: ["book", "wiki", "articles"],
      defaultTags: ["self-improvement"],
    }, {
      name: "gaming",
      subcategories: ["minecraft", "csgo"],
      defaultTags: ["entertainment"],
    }, {
      name: "walking",
      subcategories: [],
      defaultTags: ["routine"],
    }, {
      name: "teaching",
      subcategories: [],
      defaultTags: ["work", "companionship"],
    },
  ],
  tags: [
    { name: "self-improvement" },
    { name: "hobby" },
    { name: "routine" },
    { name: "entertainment" },
    { name: "work" },
    { name: "companionship" },
  ],
}

// timelineLog is an array of days that make up the history
export const timelineLog = writable(exampleTimelineLog);

export const activities = writable(exampleActivities);
