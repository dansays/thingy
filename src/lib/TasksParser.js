import { Symbols } from './Symbols';
import { StreamParser } from './StreamParser';
import { Task } from './Task';

/** A class representing a Things task parser */
export class TasksParser {

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
			let task = new Task(this._autotagger);
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
