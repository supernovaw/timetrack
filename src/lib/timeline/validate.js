/*  activities: {
 *    list: [ { name: string, subcategories: string[], defaultTags: string[] } ],
 *    tags: [ { name: string } ]
 *  } */
function validateActivities(activities) {
    if (typeof activities !== "object" || Array.isArray(activities)) return "activities is not an object";
    const activitiesKeys = Object.keys(activities);
    if (activitiesKeys.length !== 2) return `activities has wrong fields: [${activitiesKeys.join(", ")}]`;
    const { list, tags } = activities;
    if (!Array.isArray(list)) return "activities.list is not an array";
    if (!Array.isArray(tags)) return "activities.tags is not an array";

    const tagNames = new Set();
    for (let i = 0; i < tags.length; i++) {
        const itemName = `activities.tags[${i}]`;
        const tag = tags[i];
        if (typeof tag !== "object" || Array.isArray(tag)) return itemName + " is not an object";
        const keys = Object.keys(tag);
        if (keys.length !== 1) return `${itemName} has wrong fields: [${keys.join(", ")}]`;
        const { name } = tag;
        if (typeof name !== "string") return itemName + ".name is not a string";

        if (name.length === 0) return itemName + ".name is empty";
        if (name.length > 100) return itemName + ".name is too long";
        const nameLowercase = name.toLowerCase();
        if (tagNames.has(nameLowercase)) return itemName + " collides with a different tag that has the same name " + name;
        tagNames.add(nameLowercase);
    }

    const activityNames = new Set();
    for (let i = 0; i < list.length; i++) {
        const itemName = `activities.list[${i}]`;
        const activity = list[i];
        if (typeof activity !== "object" || Array.isArray(activity)) return itemName + " is not an object";
        const keys = Object.keys(activity);
        if (keys.length !== 3) return `${itemName} has wrong fields: [${keys.join(", ")}]`;
        const { name, subcategories, defaultTags } = activity;
        if (typeof name !== "string") return itemName + ".name is not a string";
        if (!Array.isArray(subcategories)) return itemName + ".subcategories is not an array";
        if (!Array.isArray(defaultTags)) return itemName + ".defaultTags is not an array";

        if (name.length === 0) return itemName + ".name is empty";
        if (name.length > 100) return itemName + ".name is too long";
        const nameLowercase = name.toLowerCase();
        if (activityNames.has(nameLowercase)) return itemName + " collides with a different activity that has the same name " + name;
        activityNames.add(nameLowercase);

        const subcategoriesSet = new Set();
        for (let j = 0; j < subcategories.length; j++) {
            const subItemName = `${itemName}.subcategories[${j}]`;
            const subcategory = subcategories[j];
            if (typeof subcategory !== "string") return subItemName + " is not a string";
            if (subcategory.length === 0) return subItemName + " is empty";
            if (subcategory.length > 100) return subItemName + " is too long";
            const subcategoryLowercase = subcategory.toLowerCase();
            if (subcategoriesSet.has(subcategoryLowercase)) return subItemName + " collides with a different subcategory";
            subcategoriesSet.add(subcategoryLowercase);
        }

        const defaultTagsSet = new Set();
        for (let j = 0; j < defaultTags.length; j++) {
            const subItemName = `${itemName}.defaultTags[${j}]`;
            const tag = defaultTags[j];
            if (typeof tag !== "string") return subItemName + " is not a string";
            if (!tagNames.has(tag)) return subItemName + " is a nonexistent tag";
            if (defaultTagsSet.has(tag)) return itemName + ".defaultTags has collisions";
            defaultTagsSet.add(tag);
        }
    }
}

/*  timelineLog: [
 *    {
 *      start: number,
 *      end?: number,
 *      isConsequent: boolean,
 *      dayLog: [ { start: number, end?: number, activityName: string, activitySubcategory: string, description: string, tags: string[] } ]
 *    }
 *  ] */
function validateTimelineLog(timelineLog, activities) {
    if (!Array.isArray(timelineLog)) return "timelineLog is not an array";

    const tagsSet = new Set(activities.tags.map(t => t.name));

    for (let dayIndex = 0; dayIndex < timelineLog.length; dayIndex++) {
        const dayName = `timelineLog[${dayIndex}]`;
        const day = timelineLog[dayIndex];
        if (typeof day !== "object" || Array.isArray(day)) return dayName + " is not an object";

        const dayKeys = new Set(Object.keys(day));
        const { start, end, isConsequent, dayLog } = day;

        if (typeof start !== "number") return dayName + ".start is not a number";
        if (start < 1000000000000) return dayName + ".start is not a valid unix ms timestamp (<2002)"
        if (start > 4000000000000) return dayName + ".start is not a valid unix ms timestamp (>2095)"
        dayKeys.delete("start");

        if (dayKeys.has("end")) {
            if (typeof end !== "number") return dayName + ".end is not a number";
            if (end < 1000000000000) return dayName + ".end is not a valid unix ms timestamp (<2002)"
            if (end > 4000000000000) return dayName + ".end is not a valid unix ms timestamp (>2095)"
            dayKeys.delete("end");
        }

        if (typeof isConsequent !== "boolean") return dayName + ".isConsequent is not a boolean";
        dayKeys.delete("isConsequent");

        if (!Array.isArray(dayLog)) return dayName + ".dayLog is not an array";
        dayKeys.delete("dayLog");

        if (dayKeys.size !== 0) return `${dayName} has extra fields: [${Object.keys(day).join(", ")}]`

        for (let i = 0; i < dayLog.length; i++) {
            const taskName = `${dayName}.dayLog[${i}]`;
            const task = dayLog[i];
            if (typeof task !== "object" || Array.isArray(task)) return taskName + " is not an object";

            const taskKeys = new Set(Object.keys(task));
            const { start, end, activityName, activitySubcategory, description, tags } = task;

            if (typeof start !== "number") return taskName + ".start is not a number";
            if (start < 1000000000000) return taskName + ".start is not a valid unix ms timestamp (<2002)"
            if (start > 4000000000000) return taskName + ".start is not a valid unix ms timestamp (>2095)"
            taskKeys.delete("start");

            if (taskKeys.has("end")) {
                if (typeof end !== "number") return taskName + ".end is not a number";
                if (end < 1000000000000) return taskName + ".end is not a valid unix ms timestamp (<2002)"
                if (end > 4000000000000) return taskName + ".end is not a valid unix ms timestamp (>2095)"
                taskKeys.delete("end");
            }

            if (typeof activityName !== "string") return taskName + ".activityName is not a string";
            const activity = activities.list.find(a => a.name === activityName);
            if (!activity) return taskName + ".activityName is a nonexistent activity";
            taskKeys.delete("activityName");

            if (typeof activitySubcategory !== "string") return taskName + ".activitySubcategory is not a string";
            if (activitySubcategory !== "" && !activity.subcategories.includes(activitySubcategory))
                return taskName + ".activitySubcategory is a nonexistent subcategory";
            taskKeys.delete("activitySubcategory");

            if (typeof description !== "string") return taskName + ".description is not a string";
            if (description.length > 200) return taskName + ".description is too long";
            taskKeys.delete("description");

            if (!Array.isArray(tags)) return taskName + ".tags is not an array";
            for (let j = 0; j < tags.length; j++) {
                const tagName = `${taskName}.tags[${j}]`;
                const tag = tags[j];
                if (typeof tag !== "string") return tagName + " is not a string";
                if (!tagsSet.has(tag)) return tagName + " is a nonexistent tag";
            }
            taskKeys.delete("tags");

            if (taskKeys.size !== 0) return `${taskName} has extra fields: [${Object.keys(task).join(", ")}]`;
        }
    }
}

export default function validate(timelineLog, activities) {
    let err;

    err = validateActivities(activities);
    if (err) return err;

    err = validateTimelineLog(timelineLog, activities);
    if (err) return err;
}
