let symbolsConfig    = (typeof symbols    !== 'undefined') ? symbols    : {};
let autotaggerConfig = (typeof autotagger !== 'undefined') ? autotagger : [];
let parser = new TasksParser(symbolsConfig, autotaggerConfig);

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
	editor.activate();;
}
