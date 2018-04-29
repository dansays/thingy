import * as config from './config';
import { Autotagger } from './lib/Autotagger';
import { TasksParser } from './lib/TasksParser';

let configNote = getConfig();
let autotagger = new Autotagger(configNote)
let parser = new TasksParser(autotagger);

let document = getDocument();
let data = parser.parse(document);
let sent = sendToThings(data);

if (sent === false) {
	context.fail();
} else if (sent === undefined) {
	context.cancel('No tasks found');
} else {
	cleanup();
}

////////////////////////////////////////////////////////////////////////////////

function getConfig() {
	let configNote = Draft.query('# Thingy Config', 'all')
		.filter(d => !d.isTrashed)
		.filter(d => d.content.startsWith('# Thingy Config'));

	if (configNote.length == 0) {
		configNote.push(addDefaultConfig());
	}

	return configNote
		.map(draft => draft.content)
		.join('\n');
}

function addDefaultConfig() {
	let configNote = Draft.create();
	configNote.content = config.defaultAutotaggerRules;
	configNote.update();
	return configNote;
}

function getDocument() {
	if (typeof editor === 'undefined') return '';
	return editor.getSelectedText() || editor.getText();
}

function sendToThings(data) {
	if (typeof CallbackURL === 'undefined') return false;
	if (typeof context === 'undefined') return false;
	if (data.length == 0) {
		context.cancel('No tasks found');
		return;
	}

	let callback = CallbackURL.create();
	callback.baseURL = 'things:///json';
	callback.addParameter('data', JSON.stringify(data));
	return callback.open();
}

function cleanup() {
	if (draft.isFlagged) return;
	if (editor.getSelectedText()) return;
	draft.isTrashed = true;
	draft.addTag('Thingy');
	draft.update();
	Draft.create();
	editor.activate();
}
