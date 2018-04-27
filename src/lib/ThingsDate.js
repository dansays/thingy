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
