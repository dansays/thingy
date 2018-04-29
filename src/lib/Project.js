export class Project {

	constructor(name, tasks) {
		this._name = name;
		this._tasks = tasks;
	}

	toThingsObject() {
		// Get an array of unique (case-insensitive) headings
		let headings = this._tasks
			.filter(item => item.attributes.heading)
			.map(item => item.attributes.heading)
			.map(item => ({ value: item, lower: item.toLowerCase() }))
			.filter((elem, pos, arr) => arr.findIndex(item => item.lower == elem.lower) == pos)
			.map(item => ({ type: "heading", attributes: { title: item.value } }));

		headings.reverse();

		let tasks = this._tasks.map(task => {
			task.attributes.list = this._name;
			return task;
		});

		return [{
			type: "project",
			attributes: {
				title: this._name,
				items: headings
			}
		}, ...tasks];

	}

}
