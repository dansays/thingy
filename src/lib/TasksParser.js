/** A class representing a Things task parser */
class TasksParser {

	/**
	 * Create a new Things task parser
	 * @param {Autotagger} autotagger - An autotagger reference
	 */
	constructor(autotagger) {
		this._symbols = new Symbols();
		this._autotagger = autotagger;
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
