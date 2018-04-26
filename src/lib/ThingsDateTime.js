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
