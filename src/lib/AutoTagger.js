import { StreamParser } from './StreamParser';
import { Symbols } from './Symbols';

/** A class representing a Things autotagger */
export class Autotagger {

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
