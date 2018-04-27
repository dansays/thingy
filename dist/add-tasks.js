/** A class representing a Things autotagger */
class Autotagger {

	/**
	 * Create a Things autotagger, including a small default dictionary
	 * @param {Object} config - An array of objects to add to the dictionary
	 */
	constructor(config = []) {
		this._dictionary = [
			{ pattern: /^Call /i, tags: 'Calls' },
			{ pattern: /^Email /i, tags: 'Email' },
			{ pattern: /^(Drop off|Pick up|Deliver) /i, tags: 'Errands' },
			{ pattern: /^(Waiting For|WF) /i, tags: 'Waiting For' },
			...config
		];

		this._dictionary.forEach(entry => {
			if (!entry.tags) return;
			entry.tags = entry.tags.split(',');
			entry.tags.map(entry => entry.trim());
		});
	}

	/**
	 * Parse a string for matching autotagging entries
	 * @param {Object} obj - An object containing task attributes
	 * @return {Object} An object containing updated task attributes
	 */
	parse(title) {
		const entries = [...this._dictionary]
			.filter(item => item.pattern.test(title));

		let attributes = {};
		entries.forEach(entry => {
			Object.keys(entry).forEach(key => {
				if (key == 'pattern') return;
				this._setProp(attributes, key, entry[key])
			});
		});

		if (attributes.tags) {
			attributes.tags = attributes.tags.join(',');
		}

		return attributes;
	}

	/**
	 * Update an object property. If the value is an array, push it real good.
	 * @param {Object} obj - A reference to the source object
	 * @param {String} prop - The name of the property to set
	 * @param {Array|String} val - The value of the property to set
	 * @private
	 */
	_setProp(obj, prop, val) {
		if (Array.isArray(val)) {
			obj[prop] = obj[prop] || [];
			obj[prop].push(...val);
		} else {
			obj[prop] = val;
		}
	}

}
/** A class representing a symbols dictionary */
class Symbols {

	/**
	 * Create a symbols dictionary
	 * @param {Object} config - An optional object overriding one or
	 * 		more symbol definitions
	 */
	constructor(config = {}) {
		this._symbols = {
			tags:          '🏷',
			list:          '📁',
			when:          '📆',
			reminder:      '⏰',
			deadline:      '⚠️',
			notes:         '🗒',
			checklistItem: '🔘'
		};

		Object.assign(this._symbols, config);
	}

	/**
	 * An array of all defined symbols.
	 * @type {String[]}
	 */
	get all() {
		return Object.values(this._symbols);
	}

	/**
	 * Look up a symbol based on an attribute name
	 * @param {String} type - A valid Things to-do attribute name
	 * @type {String}
	 */
	getSymbol(type) {
		return this._symbols[type];
	}

	/**
	 * Look up an attribute name based on a symbol
	 * @param {String} symbol - A symbol (emoji)
	 * @type {String}
	 */
	getType(symbol) {
		let symbols = this._symbols;
		let keys = Object.keys(symbols);
		return keys.filter(key => symbols[key] == symbol)[0];
	}

}
/** Class representing a single Things to-do item. */
class Task {

	/**
	 * Create a Things to-do item.
	 * @param {Autotagger} autotagger - A reference to an autotagger
	 */
	constructor(autotagger) {
		this._autotagger = autotagger;
		this._when = new ThingsDateTime();
		this._deadline = new ThingsDate();
		this.attributes = { tags: [], 'checklist-items': [] };
	}

	/**
	 * The deadline to apply to the to-do. Relative dates are
	 * parsed with the DateJS library.
	 * @type {String}
	 */
	set deadline(date) {
		this._deadline.date = date;
		this.attributes.deadline = this._deadline.toString();
	}

	/**
	 * The title or ID of the project or area to add to.
	 * @type {String}
	 */
	set list(nameOrId) {
		let prop = this._isItemId(nameOrId) ? 'list-id' : 'list';
		this.attributes[prop] = nameOrId.trim();
	}

	/**
	 * The text to use for the notes field of the to-do.
	 * @type {String}
	 */
	set notes(notes) {
		this.attributes.notes = notes.trim();
	}

	/**
	 * The time to set for the task reminder. Overrides any time
	 * specified in "when". Fuzzy times are parsed with the
	 * DateJS library.
	 * @type {String}
	 */
	set reminder(time) {
		this._when.timeOverride = time.trim();
		this.attributes.when = this._when.toString();
	}

	/**
	 * The title of the to-do. Value will be parsed by the
	 * autotagger, matching the string against a dictionary
	 * of regular expressions and auto-applying attributes
	 * for all matches.
	 * @type {String}
	 */
	set title(value) {
		this.attributes.title = value.trim();

		let autotagged = this._autotagger.parse(value);
		if (!autotagged) return;

		let properties = ['list', 'when', 'reminder', 'deadline', 'notes'];
		properties.forEach(property => {
			if (!autotagged[property]) return;
			this[property] = autotagged[property];
		});

		this.addTags(autotagged.tags || '');
		this.addChecklistItems(autotagged.checklistItems || []);
	}

	/**
	 * The start date of the to-do. Values can be "today",
	 * "tomorrow", "evening", "tonight", "anytime", "someday",
	 * or a fuzzy date string with an optional time value,
	 * which will add a reminder.
	 * @type {String}
	 */
	set when(value) {
		this._when.datetime = value.trim();
		this.attributes.when = this._when.toString();
	}

	/**
	 * Add a checklist item to the to-do.
	 * @param {String} item - The checklist item to add
	 */
	addChecklistItem(item) {
		this.addChecklistItems([ item.trim() ]);
	}

	/**
	 * Add an array of checklist items to the to-do
	 * @param {String[]} items - An array of checklist items to add
	 */
	addChecklistItems(items = []) {
		items = items
			.filter(item => item.length > 0)
			.map(item => ({
				type: 'checklist-item',
				attributes: { title: item.trim() }
			}));

		this.attributes['checklist-items'].push(...items);
	}

	/**
	 * Add one or more tags to the to-do, separated by commas.
	 * Tags that do not already exist will be ignored.
	 * @param {String} tagCsvList - A comma-separated list of one or more tags
	 */
	addTags(tagCsvList) {
		let tagArr = tagCsvList.split(',').map(tag => tag.trim());
		this.attributes.tags.push(...tagArr);
	}

	/**
	 * Export the current to-do, with all defined attributes,
	 * as an object to be passed to the things:/// URL scheme.
	 * @see {@link https://support.culturedcode.com/customer/en/portal/articles/2803573#json|Things API documentation}
	 * @return {Object} An object suitable to pass to the things:/// service
	 */
	toThingsObject() {
		return {
			type: 'to-do',
			attributes: this.attributes
		};
	}

	/**
	 * Test whether a string is a things item ID
	 * @param {String} value - The item name or id to test
	 * @private
	 */
	_isItemId(value) {
		const pattern = /^[0-9A-F]{8}-([0-9A-F]{4}-){3}[0-9A-F]{12}$/img;
		return pattern.test(value);
	}

}
/** A class representing a Things task parser */
class TasksParser {

	/**
	 * Create a new Things task parser, generating a symbol
	 * dictionary and autoparser.
	 * @param {Object} symbolsConfig - An object defining one or more
	 *   symbol definitions to override
	 * @param {Array} autotaggerConfig - An array with supplemental
	 *   autotagger dictionary items
	 */
	constructor(symbolsConfig, autotaggerConfig) {
		this._symbols = new Symbols(symbolsConfig);
		this._autotagger = new Autotagger(autotaggerConfig);
	}

	/**
	 * Parse a document containing Things tasks, and associated
	 * attributes decorated by the appropriate Emoji symbols
	 * @param doc {String} - The document to parse
	 * @return {Object} An object suitable to pass to the things:/// service
	 */
	parse(doc) {
		// Break inline attribute references into their own lines
		doc = this._normalizeSymbols(doc);

		// Trim all leading/trailing whitespace from each line
		doc = this._trimWhitespace(doc);

		let tasks = []; // An array of task objects
		let task; // The current task object

		doc.split('\n').forEach(line => {

			let item = this._parseLine(line);

			if (item && item.type == 'to-do') {
				task = new Task(this._autotagger);
				task.title = item.value;
				tasks.push(task);
				return;
			}

			// If we don't have an active task yet, or the
			// current line couldn't be parsed, move along.
			if (!task || !item) return;

			switch(item.type) {
				case 'tags':           task.addTags(item.value);          break;
				case 'checklistItem':  task.addChecklistItem(item.value); break;
				default:               task[item.type] = item.value;
			}
		});

		// Things inserts each task in the array at the top, so
		// we'll reverse it so it matches the order they were specified.
		tasks.reverse();

		// Return an array of Things objects
		return tasks.map(task => task.toThingsObject());
	}

	/**
	 * Normalize symbol-decorated attributes so they're each on their own line
	 * @param {String} value - The document to parse
	 * @return {String} A document with symbol-decorated
	 *   attributes on their own line
	 * @private
	 */
	_normalizeSymbols(value = '') {
		let pattern = new RegExp(`(${this._symbols.all.join('|')})`, 'mg');
		return value.replace(pattern, '\n$1');
	}

	/**
	 * Parse a line, mapping its symbol to a property
	 * @param {String} line - The line to parse
	 * @return {Object} An object with the parsed property type and value
	 * @private
	 */
	_parseLine(line) {
		if (!line) return;

		// Lines with no symbol prefix are tasks.
		if (/^[a-z0-9]/i.test(line)) {
			return { type: 'to-do', value: line };
		}

		let allSymbols = this._symbols.all;
		let propPattern = new RegExp(`^(${allSymbols.join('|')})\s*(.*)$`, 'g');
		let propMatch = propPattern.exec(line);
		if (!propMatch || propMatch.length < 3) return;

		return {
			type: this._symbols.getType(propMatch[1]),
			value: propMatch[2]
		};
	}

	/**
	 * Trim leading/trailing whitespace from each line of a document
	 * @param {String} value - The value to trim
	 * @return {String} A document with no leading or trailing whitespace
	 * @private
	 */
	_trimWhitespace(value = '') {
		return value
			.replace(/^\s+(.+)/mg, '$1')
			.replace(/(.+)\s+$/mg, '$1');
	}

}
/** A class representing a date in Things */
class ThingsDate {

	/** Create a new ThingsDate object */
	constructor() {}

	/**
	 * The date value. In addition to fuzzy values parseable by DateJS,
	 * valid values include "someday", "anytime", "evening", and "tonight".
	 * @type {String}
	 */
	set date(value = '') {
		this._datetime = value.trim().toLowerCase();
	}

	/**
	 * Convert to a Things-formatted string: YYYY-MM-DD@HH:MM, or
	 * relative keyword: evening, someday, anytime.
	 * @return {String} A Things-formatted date string
	 */
	toString() {
		// This is still way too big. Some of this stuff
		// should be parsed as values are set, and
		// private functions should reference object
		// properties, not passed parameters.

		// If a time override is present, but no date is specified,
		// assume this is a task for today.
		let timeOverride = this._timeOverride;
		let datetime = this._datetime || (timeOverride && 'today');

		// Shorthand values like "someday" and "anytime" cannot have
		// an associated time, and are unparseable by DateJS.
		let isDateOnly = this._isDateOnlyShorthand(datetime);
		if (isDateOnly) return datetime;

		// Shorthand values like "tonight" need to be normalized to
		// "evening" for Things to understand. However, if there's
		// a time override specified, we'll change the value
		// to "today" so DateJS can do its thing. Assuming the
		// reminder is in the evening, it'll get changed back later.
		let isEvening = this._isEveningShorthand(datetime);
		if (isEvening && !timeOverride) return 'evening';
		if (isEvening && timeOverride) datetime = 'today';

		// DateJS will take relative dates like "1 week" without
		// complaint, but it interprets them as "1 week from the
		// first day of the year". Prepend a "+" to anchor to
		// today's date.
		datetime = datetime.replace(
			/^(\d+)\s*(h|d|w|m|y|minute|hour|day|week|month|year)(s?)/i,
			'+$1 $2$3'
		);

		// DateJS won't understand dates like "in 2 weeks".
		// Reformat as "+2 weeks".
		datetime = datetime.replace(/^in\s+(\d)/i, '+$1');

		// Parse the date with DateJS. If it's invalid, just pass
		// the raw value and let Things take a crack at it.
		let dt = Date.parse(datetime);
		if (!dt) return datetime;

		// Override time if we explicitly set a reminder
		if (timeOverride) {
			let time = Date.parse(timeOverride);
			if (time) {
				let hour = time.getHours();
				let minute = time.getMinutes();
				dt.set({ hour, minute });
			}
		}

		// Sometimes relative dates, like "Monday", are
		// interpreted as "last Monday". If the date is in the
		// past, add a week.
		let isDatePast = this._isDatePast(dt);
		if (isDatePast) dt.add(1).week();

		// If the time is expressed without an AM/PM suffix,
		// and it's super early, we probably meant PM.
		let isTooEarly = this._isTimeEarlyAndAmbiguous(datetime, dt);
		if (isTooEarly) dt.add(12).hours();

		// Return a date- or datetime-formatted string that
		// Things will understand.
		return this._formatThingsDate(dt, isEvening);
	}

	/**
	 * Test whether a string is shorthand for "tonight"
	 * @param {String} value - The string to test
	 * @return {boolean} True if string equals evening shorthand keywords
	 * @private
	 */
	_isEveningShorthand(value) {
		let pattern = /^((this )?evening|tonight)$/i;
		return pattern.test(value);
	}

	/**
	 * Test whether a string is a dateless shorthand value
	 * @param {String} value - The string to test
	 * @return {boolean} True if string starts with "someday" or "anytime"
	 * @private
	 */
	_isDateOnlyShorthand(value) {
		let pattern = /^(someday|anytime)/i;
		return pattern.test(value);
	}

	/**
	 * Test whether a date is in the past
	 * @param {Date} parsed - The datetime, parsed by DateJS
	 * @return {boolean} True if the date is in the past
	 * @private
	 */
	_isDatePast(parsed) {
		let date = parsed.clone().clearTime();
		let today = Date.today().clearTime();
		return date.compareTo(today) == -1;
	}

	/**
	 * Test whether a time is ambiguously specified (lacking an am/pm
	 * suffix) and possibly early in the morning.
	 * @param {String} str - The raw, unparsed date
	 * @param {DateJS} parsed - The datetime, parsed by DateJS
	 * @return {boolean} True if AM/PM suffix is missing and hour is before 7
	 * @private
	 */
	_isTimeEarlyAndAmbiguous(str, parsed) {
		let hasAmPmSuffix = /\d *[ap]m?\b/i.test(str);
		let isEarly = parsed.getHours() > 0 && parsed.getHours() < 7;
		return !hasAmPmSuffix && isEarly;
	}

	/**
	 * Test whether a datetime is set to midnight
	 * @param {DateJS} parsed - The datetime, parsed by DateJS
	 * @return {boolean} True if time is midnight
	 * @private
	 */
	_isTimeMidnight(parsed) {
		let hours = parsed.getHours();
		let minutes = parsed.getMinutes();
		return hours + minutes == 0;
	}

	/**
	 * Format a DateJS datetime as a valid Things datetime string.
	 * @param {DateJS} datetime - The datetime, parsed by DateJS
	 * @param {boolean} forceEvening - Force to evening, overriding time value
	 * @return {string} A Things-formatted date
	 * @private
	 */
	_formatThingsDate(datetime, forceEvening) {
		let date = datetime.toString('yyyy-MM-dd');
		let time = datetime.toString('@HH:mm');

		if (this._isTimeMidnight(datetime)) time = '';
		if (!this._allowTime) time = '';

		let isToday = datetime.between(Date.today(), Date.today().addDays(1));
		let isEvening = forceEvening || datetime.getHours() > 17;
		if (isToday && isEvening) date = 'evening';

		return date + time;
	}

}
/**
 * A class representing a datetime in Things
 * @extends ThingsDate
 * */
class ThingsDateTime
extends ThingsDate {

	/** Create a new ThingsDate object */
	constructor() {
		super();
		this._allowTime = true;
	}

	/**
	 * The date, with optional time. In addition to fuzzy values parseable by
	 * DateJS, valid values include "someday", "anytime", "evening", and "tonight".
	 * @type {String}
	 */
	set datetime(value) {
		this._datetime = value.trim().toLowerCase();
	}

	/**
	 * The time override. The datetime value's hour and minute
	 * will be repolaced with the time override if specified.
	 * @type {String}
	 */
	set timeOverride(value) {
		this._timeOverride = value.trim().toLowerCase();
	}

}
let symbolsConfig    = (typeof symbols    !== 'undefined') ? symbols    : {};
let autotaggerConfig = (typeof autotagger !== 'undefined') ? autotagger : [];
let parser = new TasksParser(symbolsConfig, autotaggerConfig);

let document = getDocument();
let data = parser.parse(document);
let sent = sendToThings(data);

if (sent === false) {
	context.fail();
} else if (sent === undefined) {
	context.cancel('No tasks found');
} else {
	cleanup();
}

////////////////////////////////////////////////////////////////////////////////

function getDocument() {
	if (typeof editor === 'undefined') return '';
	return editor.getSelectedText() || editor.getText();
}

function sendToThings(data) {
	if (typeof CallbackURL === 'undefined') return false;
	if (typeof context === 'undefined') return false;
	if (data.length == 0) {
		context.cancel('No tasks found');
		return;
	}

	let callback = CallbackURL.create();
	callback.baseURL = 'things:///json';
	callback.addParameter('data', JSON.stringify(data));
	return callback.open();
}

function cleanup() {
	if (draft.isFlagged) return;
	if (editor.getSelectedText()) return;
	draft.isTrashed = true;
	draft.addTag('Thingy');
	draft.update();
	Draft.create();
	editor.activate();;
}
