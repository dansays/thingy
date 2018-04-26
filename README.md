# Thingy: A Things Parser for Drafts 5

Like most parsers, multiple tasks can be specified, one task per line:

```
Vacuum the rug
Paint the lawn
Mow the hedge
Shave the chickens
```

Properties can be defined by prefacing the value with an emoji (these can be
customized by editing `add-tasks.config.js`):

|    | Property       | Note                                                    |
|----|----------------|---------------------------------------------------------|
| 🏷 | Tags           | One or more, separated by commas                        |
| 📁 | List           | Must be exact project or area name or ID                |
| 📆 | When           | Can be fuzzy date; including a time will set a reminder |
| ⏰ | Reminder       | Time only; can also be appended to "when" value         |
| ⚠️ | Deadline       | Date only, time will be ignored                         |
| 🔘 | Checklist item | Can include multiple item definitions                   |
| 🗒 | Notes          | Ironically, no notes about this                         |

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

## Autotagger

Tags and other properties can be automatically applied based on [regular
expressions](http://codular.com/regex). A handful of patterns are defined
by default:

1. Tasks beginning with _Call_ will be tagged with "Calls"
2. Tasks beginning with _Email_ will be tagged with "Email"
3. Tasks beginning with _Drop off_, _Pick up_, or _Deliver_ will be tagged with "Errands"
4. Tasks beginning with _Waiting For_ or _WF_ will be tagged with "Waiting For"

You can define your own rules by editing `add-tasks.config.js`. A few examples from my own personal setup:

1. Automatically set a default start date (tomorrow) and deadline (in one week) for "waiting for" tasks
2. Add an agenda tag for tasks mentioning my wife's name
3. Add a "Grocery Store" tag to tasks with relevant keywords, and file them in my "Health & Nutrition" list.

```javascript
const autotagger = [{
  pattern: /^(Waiting For |WF) /i,
  when: '+1d',
  deadline: '+1w'
}, {
  pattern: /\bKathryn\b/i,
  tags: 'Kathryn'
}, {
  pattern: /\b(grocery store|Whole Foods|Gristedes)\b/i,
  tags: 'Grocery Store',
  list: 'Health & Nutrition'
}];
```

So, adding a task titled "Waiting for Kathryn to finalize plans for Maui trip"
will automatically apply a "Waiting For" tag, a "Kathryn" tag, set the start
date to tomorrow, and set a deadline of one week from now.
[Boom](https://www.youtube.com/watch?v=Y38Sb3FOYmY).

## Date Parser

While Things does an admirable job parsing natural language dates, I opted to
employ DateJS to allow for additional flexibility. Some examples of valid dates:

- Tonight
- Next Saturday
- in 3 weeks
- +4d
- July

A few things to note:

- If only a time is specified, today's date will be assumed
- If the time is after 5pm, it will be automatically categorized in the
	"this evening" section.
- If a specified time is before 7:00 and lacks an am/pm suffix, it will
  be assumed to be in the evening. No accidental reminders at 5am.

## Installation

An action group is available in the [Drafts Action Directory](https://actions.getdrafts.com/g/1HG). If you wish to customize, run `npm run build` to generate the bundled script to import into Drafts.
