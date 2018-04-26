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
