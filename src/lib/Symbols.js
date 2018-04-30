/** A class representing a symbols dictionary */
export class Symbols {

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
