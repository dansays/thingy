/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */,
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";

// CONCATENATED MODULE: ./src/config.js
// When times omit an AM/PM suffix and are before this hour,
// we'll assume PM to avoid early morning alarms.
const earliestAmbiguousMorningHour = 6;

// When a task date is today, and a reminder is set to a time
// at this hour or later, we'll file it in the "evening" section.
const eveningStartsAtHour = 6;

const autotaggerRulesDraftTitle = 'Thingy Autotagger Rules';
const newAutotaggerRulesMessage = `Welcome to Thingy! A draft with a few default Autotagger rules has been added to your inbox. Feel free to customize these as you see fit, and you can archive the draft if you don't want it cluttering up your inbox.`;
const defaultAutotaggerRules =
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

const reservedTemplateTags = [
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

// CONCATENATED MODULE: ./src/lib/StreamParser.js
/** A class representing a stream parser */
class StreamParser {

	/**
	 * Create a new stream parser
	 * @param symbols {Symbols} - A symbol dictionary object
	 */
	constructor(symbols) {
		this._symbols = symbols;
	}

	/**
	 * Parse a stream containing items and associated attributes
	 * decorated by Emoji symbols
	 * @param doc {String} - The document to parse
	 * @return {Object} An object suitable to pass to the things:/// service
	 */
	parse(stream) {
		stream = this._normalizeSymbols(stream);
		stream = this._trimWhitespace(stream);

		let all = []; // An array of task objects
		let current; // The current task object

		stream.split('\n').forEach(line => {
			let item = this._parseLine(line);
			if (!item) return;

			if (item.type == 'title') {
				current = {};
				all.push(current);
			}

			switch (item.format) {
				case 'array':
					current[item.type] = current[item.type] || [];
					current[item.type].push(item.value.trim());
					break;
				case 'csv':
					current[item.type] = [
						...(current[item.value] || '').split(','),
						...item.value.split(',')
					].map(item => item.trim()).filter(item => item.length > 0).join(',');
					break;
				default:
					current[item.type] = item.value.trim();
			}

		});

		return all;
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
			return { type: 'title', value: line };
		}

		let allSymbols = this._symbols.all;
		let propPattern = new RegExp(`^(${allSymbols.join('|')})\s*(.*)$`, 'g');
		let propMatch = propPattern.exec(line);
		if (!propMatch || propMatch.length < 3) return;

		return {
			type: this._symbols.getType(propMatch[1]),
			format: this._symbols.getFormat(propMatch[1]),
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

// CONCATENATED MODULE: ./src/lib/Symbols.js
/** A class representing a symbols dictionary */
class Symbols {

	/**
	 * Create a symbols dictionary
	 * @param {Object} config - An optional object overriding one or
	 * 		more symbol definitions
	 */
	constructor() {
		this._symbols = [
			{ symbol: '🏷', type: 'tags',          format: 'csv'    },
			{ symbol: '📁', type: 'list',          format: 'string' },
			{ symbol: '📆', type: 'when',          format: 'string' },
			{ symbol: '⏰', type: 'reminder',      format: 'string' },
			{ symbol: '⚠️', type: 'deadline',      format: 'string' },
			{ symbol: '📌', type: 'heading',       format: 'string' },
			{ symbol: '🗒', type: 'notes',         format: 'string' },
			{ symbol: '🔘', type: 'checklistItem', format: 'array'  }
		];
	}

	/**
	 * An array of all defined symbols.
	 * @type {String[]}
	 */
	get all() {
		return this._symbols.map(item => item.symbol);
	}

	/**
	 * Look up a symbol based on an attribute name
	 * @param {String} type - A valid Things to-do attribute name
	 * @return {String}
	 */
	getSymbol(type) {
		let item = this._lookup(type)
		return item && item.symbol;
	}

	/**
	 * Look up an attribute name based on a symbol
	 * @param {String} symbol - A symbol (emoji)
	 * @return {String}
	 */
	getType(symbol) {
		let item = this._lookup(symbol);
		return item && item.type;
	}

	/**
	 * Look up a datatype based on a symbol
	 * @param {String} symbol - A symbol (emoji)
	 */
	getFormat(val) {
		let item = this._lookup(val);
		return item && item.format;
	}

	_lookup(val) {
		return this._symbols.find(item => item.symbol == val || item.type == val);
	}

}

// CONCATENATED MODULE: ./src/lib/Autotagger.js



/** A class representing a Things autotagger */
class Autotagger_Autotagger {

	/**
	 * Create a Things autotagger, including a small default dictionary
	 * @param {Object} config - An array of objects to add to the dictionary
	 */
	constructor(config) {
		let symbols = new Symbols();
		let parser = new StreamParser(symbols);
		let stream = parser.parse(config);

		this._dictionary = stream.map(item => {
			let rule = { pattern: this._parsePattern(item.title), ...item };
			delete rule.title;
			return rule;
		}).filter(item => !!item.pattern);

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

		return attributes;
	}

	_parsePattern(title) {
		if (title.trim().toLowerCase() == 'all tasks') return /.+/;

		let pattern = /^(Starts with|Ends with|Contains|Matches) +"(.*)"$/i;
		let matches = pattern.exec(title);
		if (!matches || matches.length < 3) return;
		let regex = matches[2];
		let escaped = this._escapeRegex(matches[2]);

		switch (matches[1].toLowerCase()) {
			case 'starts with': return new RegExp(`^(${escaped})\\b`, 'i');
			case 'ends with':   return new RegExp(`\\b(${escaped})$`, 'i');
			case 'contains':    return new RegExp(`\\b(${escaped})\\b`, 'i');
			case 'matches':     return new RegExp(regex, 'i');
		}
	}

	_escapeRegex(value) {
		// Ommitting | since it'll be our delimiter
		let pattern = /[\\{}()[\]^$+*?.]/g;
		return value.replace(pattern, '\\$&');
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

// CONCATENATED MODULE: ./src/lib/ThingsDate.js


/** A class representing a date in Things */
class ThingsDate_ThingsDate {

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

		// Offset shorthand
		let offset = this._parseOffset(datetime);
		let dateOffset = 0;
		if (offset) {
			datetime = offset.datetime;
			dateOffset = offset.offset;
		}

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

		// Process date offset
		if (dateOffset != 0) dt.add(dateOffset).days();

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
		let earliest = earliestAmbiguousMorningHour;
		let isEarly = parsed.getHours() > 0 && parsed.getHours() < earliest;
		return !hasAmPmSuffix && isEarly;
	}

	_parseOffset(str) {
		let pattern = /^(.+)\s([+-]\d+)$/;
		let match = pattern.exec(str);
		if (!match) return;
		return { datetime: match[1], offset: parseInt(match[2]) };
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
		let isEvening = forceEvening || datetime.getHours() > eveningStartsAtHour;
		if (isToday && isEvening) date = 'evening';

		return date + time;
	}

}

// CONCATENATED MODULE: ./src/lib/ThingsDateTime.js


/**
 * A class representing a datetime in Things
 * @extends ThingsDate
 * */
class ThingsDateTime_ThingsDateTime extends ThingsDate_ThingsDate {

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

// CONCATENATED MODULE: ./src/lib/Task.js



/** Class representing a single Things to-do item. */
class Task_Task {

	/**
	 * Create a Things to-do item.
	 * @param {Autotagger} autotagger - A reference to an autotagger
	 */
	constructor(autotagger) {
		this._autotagger = autotagger;
		this._when = new ThingsDateTime_ThingsDateTime();
		this._deadline = new ThingsDate_ThingsDate();
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

	set heading(heading) {
		this.attributes.heading = heading.trim();
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

		const properties = 'list when reminder deadline notes heading checklistItem';
		properties.split(' ').forEach(property => {
			if (!autotagged[property]) return;
			this[property] = autotagged[property];
		});

		this.addTags(autotagged.tags || '');
		this.addChecklistItem(autotagged.checklistItem || []);
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
		if (item.trim) item = item.trim();
		if (!Array.isArray(item)) item = [ item ];
		this.addChecklistItems(item);
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
	 * @param {String|String[]} tags - An array or comma-separated list of one or more tags
	 */
	addTags(tags) {
		if (typeof tags == 'string') tags = tags.split(',');
		this.attributes.tags.push(...tags.map(tag => tag.trim()));
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

// CONCATENATED MODULE: ./src/lib/TasksParser.js




/** A class representing a Things task parser */
class TasksParser_TasksParser {

	/**
	 * Create a new Things task parser
	 * @param {Autotagger} autotagger - An autotagger reference
	 */
	constructor(autotagger) {
		this._symbols = new Symbols();
		this._streamParser = new StreamParser(this._symbols);
		this._autotagger = autotagger;
	}

	/**
	 * Parse a document containing Things tasks, and associated
	 * attributes decorated by the appropriate Emoji symbols
	 * @param stream {String} - The document to parse
	 * @return {Object} An object suitable to pass to the things:/// service
	 */
	parse(stream) {

		let items = this._streamParser.parse(stream);
		let tasks = items.map(item => {
			let task = new Task_Task(this._autotagger);
			Object.keys(item).forEach(attr => {
				switch(attr) {
					case 'tags': task.addTags(item[attr]); break;
					case 'checklistItem': task.addChecklistItem(item[attr]); break;
					default: task[attr] = item[attr];
				}
			});
			return task;
		})

		// Things inserts each task in the array at the top, so
		// we'll reverse it so it matches the order they were specified.
		tasks.reverse();

		// Return an array of Things objects
		return tasks.map(task => task.toThingsObject());
	}
}

// CONCATENATED MODULE: ./src/lib/Project.js
class Project {

	constructor(name, tasks) {
		this._name = name;
		this._tasks = tasks;
	}

	toThingsObject() {
		// Get an array of unique (case-insensitive) headings
		let headings = this._tasks
			.filter(item => item.attributes.heading)
			.map(item => item.attributes.heading)
			.map(item => ({ value: item, lower: item.toLowerCase() }))
			.filter((elem, pos, arr) => arr.findIndex(item => item.lower == elem.lower) == pos)
			.map(item => ({ type: "heading", attributes: { title: item.value } }));

		headings.reverse();

		let tasks = this._tasks.map(task => {
			task.attributes.list = this._name;
			return task;
		});

		return [{
			type: "project",
			attributes: {
				title: this._name,
				items: headings
			}
		}, ...tasks];

	}

}

// CONCATENATED MODULE: ./src/add-tasks.js





let add_tasks_configNote = getConfig();
let add_tasks_autotagger = new Autotagger_Autotagger(add_tasks_configNote)
let add_tasks_parser = new TasksParser_TasksParser(add_tasks_autotagger);

let add_tasks_document = getDocument();
let add_tasks_tags = getTemplateTags(add_tasks_document);
if (add_tasks_tags.length > 0) {
	let tagVals = askTemplateQuestions(add_tasks_tags);
	add_tasks_document = setTemplateTags(add_tasks_document, tagVals);
}

let data = add_tasks_parser.parse(add_tasks_document);

let firstLine = add_tasks_document.split('\n')[0];
if (firstLine.startsWith('#')) {
	let title = firstLine.substring(1).trim();
	let project = new Project(title, data);
	data = project.toThingsObject();
}

let sent = sendToThings(data);

if (draft.title == autotaggerRulesDraftTitle) {
	alert(`Oops! You probably don't want to add your Autotagger rules as Things tasks.`);
	context.cancel();
} else if (sent === false) {
	context.fail();
} else if (sent === undefined) {
	context.cancel('No tasks found');
} else {
	cleanup();
}

////////////////////////////////////////////////////////////////////////////////

function getConfig() {
	let configNote = Draft.query(`# ${autotaggerRulesDraftTitle}`, 'all')
		.filter(d => d.content.startsWith(`# ${autotaggerRulesDraftTitle}`))
		.filter(d => !d.isTrashed);

	if (configNote.length == 0) {
		configNote.push(addDefaultConfig());
	}

	return configNote
		.map(draft => draft.content)
		.join('\n');
}

function addDefaultConfig() {
	let configNote = Draft.create();
	configNote.content = defaultAutotaggerRules;
	configNote.update();
	alert(newAutotaggerRulesMessage);
	return configNote;
}

function getDocument() {
	if (typeof editor === 'undefined') return '';
	if (draft.title == autotaggerRulesDraftTitle) return '';
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
	if (draft.isArchived) return;
	if (draft.title == autotaggerRulesDraftTitle) return;
	if (editor.getSelectedText()) return;
	draft.isTrashed = true;
	draft.update();
	Draft.create();
	editor.activate();
}

function getTemplateTags(doc) {
	let pattern = /\[\[([\w ]+)\]\]/g;
	let tags = [];
	let match;

	while (match = pattern.exec(doc)) {
		let name = match[1];
		if (tags.indexOf(name) >= 0) continue;
		if (reservedTemplateTags.indexOf(name) >= 0) contiue;
		tags.push(match[1]);
	}

	return tags;
}

function askTemplateQuestions(tags) {
	let prompt = Prompt.create();
	prompt.title = 'Template Questions';
	tags.forEach(tag => prompt.addTextField(tag, tag, ''));
	prompt.addButton('Okay');
	return prompt.show() && prompt.fieldValues;
}

function setTemplateTags(doc, tags) {
	Object.keys(tags).forEach(tag => draft.setTemplateTag(tag, tags[tag]));
	return draft.processTemplate(doc);
}


/***/ })
/******/ ]);