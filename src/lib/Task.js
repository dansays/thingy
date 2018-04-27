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
