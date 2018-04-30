/** A class representing a stream parser */
export class StreamParser {

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
