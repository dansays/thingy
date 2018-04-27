# Thingy: A Things Parser for Drafts 5

## Installation

An action group is available for download in the
[Drafts Action Directory](https://actions.getdrafts.com/g/1HG). If you wish to
customize, run `npm run build` to generate the bundled script to import into Drafts.

## Overview

Like most parsers, multiple tasks can be specified, one task per line:

```
Vacuum the rug
Paint the lawn
Mow the hedge
Shave the chickens
```

If you select text in a draft, only that text will be processed. Properties can
be defined by prefacing the value with an emoji. Keyboard actions are provided
to facilitate easy entry.

|    | Property       | Note                                                    |
|----|----------------|---------------------------------------------------------|
| 🏷 | Tags           | One or more, separated by commas                        |
| 📁 | List           | Must be exact project or area name or ID                |
| 📆 | When           | Can be fuzzy date; including a time will set a reminder |
| ⏰ | Reminder       | Time only; can also be appended to "when" value         |
| ⚠️ | Deadline       | Date only, time will be ignored                         |
| 📌 | Heading        | Heading name (exact; ignored if doesn't exist)          |
| 🔘 | Checklist item | Can include multiple item definitions                   |
| 🗒 | Notes          | Ironically, no notes about this                         |

So now our tasks can have tags, be assigned to lists, and given notes, dates,
and checklist items:

```
Vacuum the rug 🏷 Home 📁 Chores ⏰ 3:00
Paint the lawn 🏷 Home 📁 Landscaping
Mow the hedge 🏷 Home 📁 Landscaping
Shave the chickens 🏷 Farm 📁 Livestock 📆 Tonight 7pm
```

Adding whitespace makes things a bit more readable. The keyboard actions
included in the bundle automatically format properties on a new line, with
indentation:

```
Vacuum the rug
  📁 Chores
  🏷 Home
  ⏰ 3:30

Paint the lawn
  📁 Landscaping
  🏷 Home
  📆 Next Saturday
  🔘 Wash brushes and rollers
  🔘 Lay down tarp to protect sidewalk
  🔘 Make sure paint can lids are closed tightly!

Mow the hedge
  📁 Landscaping
  🏷 Home
  ⚠️ 2 weeks

Shave the chickens
  📁 Livestock
  🏷 Farm
  📆 Tonight 7pm
  🗒 Remember to use a fresh razor blade!
```

## Dates

While Things does an admirable job parsing natural language dates, I opted to
employ DateJS to allow for additional flexibility. Some examples of valid dates:

- Tonight
- Next Saturday
- in 3 weeks
- +4d
- July
- Someday

A few things to note:

- If only a time is specified, today's date will be assumed
- If a time associated with today's date is after 5pm, the task will be
  automatically categorized in the "this evening" section.
- If a specified time is before 7:00 and lacks an am/pm suffix, it will
  be assumed to be in the evening. We don't want accidental reminders at 5am.

## Autotagger

Tags and other properties can be automatically applied to tasks based on
pattern-based rules. When you first run the "Add Things Tasks" action, a new
"Thingy Config" draft note will be placed in your inbox. This note will contain
a handful of default autotagger rules:

```markdown
# Thingy Config

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
```

You can edit or add to these rules as you see fit. Feel free to archive the
draft if you don't want it cluttering up your inbox... just don't change the
title. (Side note: You can have multiple config files if you want. Just make
sure the title starts with "# Thingy Config".)

Autotagger rules are defined just like tasks, but follow a specific notation:

| Syntax                    | Description                             |
| ------------------------- | --------------------------------------- |
| `Starts with "Call"`      | Task must start with "Call"             |
| `Ends with "ASAP"`        | Task must end with "ASAP"               |
| `Contains "groceries"`    | Task must contain the word "groceries"  |
| `Matches "^Bug( #\d+)?:"` | Task must match the regular expression  |
| `All tasks`               | Match all tasks                         |

All rules are case-insensitive, and all but regular expression rules must be
anchored against word boundaries. For example, `Starts with "Call"` will
match "Call Bob", but not "Callously berate Bob for constantly being late".

Multiple options can be referenced, separated by the `|` character. For example,
`Contains "groceries|grocery store|Whole Foods"` will match tasks that contain
"groceries", "grocery store", or "Whole Foods".
