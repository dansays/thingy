let config = getConfig();
let autotagger = new autotagger(config)
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

const defaultConfig =
`# Thingy Config

Starts with "Call"   🏷 Calls
Starts with "Email"  🏷 Email
Contains "Mom"       🏷 Mom
Contains "Dad"       🏷 Dad

Starts with "Waiting For|WF"
  🏷 Waiting For
  📆 Tomorrow
  ⚠️ 1 week

Starts with "Drop off|Pick up|Deliver"
  🏷 Errands
`;

////////////////////////////////////////////////////////////////////////////////

function getConfig() {
	let config = Draft.query('# Thingy Config', 'all')
		.filter(d => !d.isTrashed)
		.filter(d => d.content.startsWith('# Thingy Config'));

	if (config.length == 0) {
		config.push(addDefaultConfig());
	}

	return config
		.map(draft => draft.content)
		.join('\n');
}

function addDefaultConfig() {
	let config = Draft.create();
	config.content = defaultConfig;
	config.update();
	return config;
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
