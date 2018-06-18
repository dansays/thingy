import * as config from './config';
import { Autotagger } from './lib/Autotagger';
import { TasksParser } from './lib/TasksParser';
import { Project } from './lib/Project';

let configNote = getConfig();
let autotagger = new Autotagger(configNote)
let parser = new TasksParser(autotagger);

let document = getDocument();
let tags = getTemplateTags(document);
if (tags.length > 0) {
	let tagVals = askTemplateQuestions(tags);
	document = setTemplateTags(document, tagVals);
}

let data = parser.parse(document);

let firstLine = document.split('\n')[0];
if (firstLine.startsWith('#')) {
	let title = firstLine.substring(1).trim();
	let project = new Project(title, data);
	data = project.toThingsObject();
}

let sent = sendToThings(data);

if (draft.title == config.autotaggerRulesDraftTitle) {
	alert(`Oops! You probably don't want to add your Autotagger rules as Things tasks.`);
	context.cancel();
} else if (sent === false) {
	context.fail();
} else if (sent === undefined) {
	context.cancel('No tasks found');
} else {
	cleanup();
}

////////////////////////////////////////////////////////////////////////////////

function getConfig() {
	let configNote = Draft.query(`# ${config.autotaggerRulesDraftTitle}`, 'all')
		.filter(d => d.content.startsWith(`# ${config.autotaggerRulesDraftTitle}`))
		.filter(d => !d.isTrashed);

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
	alert(config.newAutotaggerRulesMessage);
	return configNote;
}

function getDocument() {
	if (typeof editor === 'undefined') return '';
	if (draft.title == config.autotaggerRulesDraftTitle) return '';
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
	if (draft.isArchived) return;
	if (draft.title == config.autotaggerRulesDraftTitle) return;
	if (editor.getSelectedText()) return;
	draft.isTrashed = true;
	draft.update();
	Draft.create();
	editor.activate();
}

function getTemplateTags(doc) {
	let pattern = /\[\[([\w ]+)\]\]/g;
	let tags = [];
	let match;

	while (match = pattern.exec(doc)) {
		let name = match[1];
		if (tags.indexOf(name) >= 0) continue;
		if (config.reservedTemplateTags.indexOf(name) >= 0) continue;
		tags.push(match[1]);
	}

	return tags;
}

function askTemplateQuestions(tags) {
	let prompt = Prompt.create();
	prompt.title = 'Template Questions';
	tags.forEach(tag => prompt.addTextField(tag, tag, ''));
	prompt.addButton('Okay');
	return prompt.show() && prompt.fieldValues;
}

function setTemplateTags(doc, tags) {
	Object.keys(tags).forEach(tag => draft.setTemplateTag(tag, tags[tag]));
	return draft.processTemplate(doc);
}
