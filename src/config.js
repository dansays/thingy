// When times omit an AM/PM suffix and are before this hour,
// we'll assume PM to avoid early morning alarms.
export const earliestAmbiguousMorningHour = 6;

// When a task date is today, and a reminder is set to a time
// at this hour or later, we'll file it in the "evening" section.
export const eveningStartsAtHour = 18;

export const autotaggerRulesDraftTitle = 'Thingy Autotagger Rules';
export const newAutotaggerRulesMessage = `Welcome to Thingy! A draft with a few default Autotagger rules has been added to your inbox. Feel free to customize these as you see fit, and you can archive the draft if you don't want it cluttering up your inbox.`;

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
`;

export const reservedTemplateTags = [
	'body',
	'clipboard',
	'created_latitude',
	'created_longitude',
	'created',
	'date',
	'draft_open_url',
	'draft',
	'latitude',
	'longitude',
	'modified_latitude',
	'modified_longitude',
	'modified',
	'selection_length',
	'selection_start',
	'selection',
	'time',
	'title',
	'uuid'
];
