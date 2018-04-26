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
