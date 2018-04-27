# Thingy: A Things Parser for Drafts 5

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

## Autotagger

Tags and other properties can be automatically applied based on [regular
expressions](http://codular.com/regex). A handful of patterns are defined
by default, or you can [define your own rules](#custom-autotagger-rules).

1. Tasks beginning with _Call_ will be tagged with "Calls"
2. Tasks beginning with _Email_ will be tagged with "Email"
3. Tasks beginning with _Drop off_, _Pick up_, or _Deliver_ will be tagged with "Errands"
4. Tasks beginning with _Waiting For_ or _WF_ will be tagged with "Waiting For"

## Date Parser

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

## Installation

An action group is available for download in the
[Drafts Action Directory](https://actions.getdrafts.com/g/1HG). If you wish to
customize, run `npm run build` to generate the bundled script to import into Drafts.

## Custom Autotagger Rules

In addition to the built-in autotagger rules, you can define your own custom
rules for automatically adding properties to tasks. You'll need to edit a bit
of Javascript code, but I'll do my best to make it as simple as possible for
non-programmers.

### Adding an Autotagger Rule

1. In the "Actions" menu, swipe right on the “Add tasks to Things” action, and
   select "Edit"
2. Tap "Steps"
3. Tap the top script
4. Tap the "Edit" button
5. Scroll to the bottom of the script, where you will find an `autotagger`
   object array
6. Append an entry to the autotagger object array, with the following signature:

```javascript
{
  // More info on regular expressions below...
  pattern: /^valid reg(ular)? ex(pression)? pattern$/i,

  // These properties are optional, and will overwrite any
  // values set in previously matched rules...
  when: 'Saturday',
  reminder: '2pm',
  deadline: 'Sunday',
  notes: 'Yada, yada, yada',

  // These properties are optional, and will append to
  // any values set in previously matched rules...
  tags: 'Errands, Grocery Store',
  checklistItems: [
    'You can have multiple checklist items...',
    'Just put them in a string array...',
    'Like this!'
  ]
}
```

### An Example Autotagger Ruleset

Here's an annotated, simplified excerpt from my personal autotagger ruleset.

```javascript
const autotagger = [

  // Automatically set a default start date (tomorrow) and deadline
  // (in one week) for tasks that start with "Waiting For" or "WF"
  {
    pattern: /^(Waiting For|WF)\b/i,
    when: '+1d',
    deadline: '+1w'
  },

  // Add an agenda tag for tasks which mention my wife's name
  {
    pattern: /\bKathryn\b/i,
    tags: 'Kathryn'
  },

  // Add a "Grocery Store" tag to tasks with relevant keywords, and file
  // them in my "Health & Nutrition" area list.
  {
    pattern: /\b(grocery store|Whole Foods|Gristedes)\b/i,
    tags: 'Grocery Store',
    list: 'Health & Nutrition'
  }
];
```

The `pattern` property is formatted as a
[regular expression](http://marvin.cs.uidaho.edu/Handouts/regex.html) (or regex).
Regular expressions can be quite complicated, but for the most purposes you
won't need to know much beyond the basics. I'll attempt to offer a simple
"Regex 101" by way of explaining the first `pattern` in my example:
`/^(Waiting For|WF)\b/i`. It looks complicated, but it's not that bad:

1. Regular expressions are wrapped in forward slashes, much like strings
   are wrapped in quotes. The `i` at the end signals that the pattern is
   case-insensitive, matching regardless of whether the text is upper or
   lower case.
2. Next, the `^` symbol anchors the pattern to the beginning of the title.
   In this case, we want to match only task titles which begin with "waiting for"
   or "wf", but not those for which the string appears in the middle or at the
	 end of the string. If you don't care where the phrase occurs, just
   omit the `^` symbol, but take care to specify a word boundary before your
	 match phrase (see #4).
3. The parentheses allow grouping of multiple options, separated by a `|`
   character. If you're only matching one string, you needn't wrap it in
   paranthases.
4. The `\b` indicates a word boundry, which can be either whitespace or
   punctuation. This allows us to prevent matching patterns which might
   appear within a word. For example, `/\bcat\b/` would match "cat" but
   not "catfish" or "tomcat".

So, given my example ruleset: adding a task titled "Waiting for Kathryn to
finalize plans for Maui trip" will automatically apply a "Waiting For" tag, a
"Kathryn" tag, set the start date to tomorrow, and set a deadline of one week
from now. [Boom](https://www.youtube.com/watch?v=Y38Sb3FOYmY).
