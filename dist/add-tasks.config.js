// Task properties are
// decorated with Emoji
// symbols. You may override
// any or all of these symbols
// as you see fit.

const symbols = {
	tags:          '🏷',
	list:          '📁',
	when:          '📆',
	reminder:      '⏰',
	deadline:      '⚠️',
	notes:         '🗒',
	checklistItem: '🔘'
};

// Tasks are matched against
// an autotagger dictionary,
// which automatically applies
// properties if the task text
// matches a regex pattern.
// Each object in the array
// must have:

// 1. A "pattern" property,
// defined as valid regular
// expression

// 2. One or more of the
// following properties:

// - tags
// - list
// - when
// - reminder
// - deadline
// - notes
// - checklistItems

// The checklistItems property
// value must be specified as
// an array of strings. All
// other properties are
// defined as strings.

// Examples:

// [{
//   pattern: /^Clean /i,
//   tags: ['cleaning'],
//   list: 'Chores'
// }, {
//   pattern: / next week/i,
//   when: 'next monday',
//   reminder: '9am'
// }]

// The autotagging dictionary
// is automatically populated
// with the following default
// entries:

// 1. Tasks starting with
// "Call" will be auto-tagged
// with "Calls"

// 2. Tasks starting with
// "Email" will be auto-tagged
// with "Email"

// 3. Tasks starting with
// "WF" or "Waiting for" will
// be auto-tagged with
// "Waiting For".

// 4. Tasks starting with
// "Drop off", "Pick up", or
// "Deliver" will be tagged
// with "Errands"

const autotagger = [{
	pattern: /\b(Whole Foods|grocery store)\b/i,
	tags: 'Grocery Store'
}, {
	pattern: /\b(Duane Reade|drug store|pharmacy)\b/i,
	tags: 'Pharmacy'
}, {
	pattern: /^(Waiting For|WF) /i,
	when: '+1d',
	deadline: '+1w'
}];
