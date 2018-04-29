// When times omit an AM/PM suffix and are before this hour,
// we'll assume PM to avoid early morning alarms.
export const earliestAmbiguousMorningHour = 6;

// When a task date is today, and a reminder is set to a time
// at this hour or later, we'll file it in the "evening" section.
export const eveningStartsAtHour = 6;

export const autotaggerRulesDraftTitle = 'Thingy Config';

export const defaultAutotaggerRules =
`# ${autotaggerRulesDraftTitle}

Starts with "Call"   🏷 Calls
Starts with "Email"  🏷 Email
Contains "Mom"       🏷 Mom
Contains "Dad"       🏷 Dad

Starts with "Waiting For|WF"
  🏷 Waiting For
  📆 Tomorrow
  ⚠️ 1 week

Starts with "Drop off|Pick up|Deliver"
  🏷 Errands
`
