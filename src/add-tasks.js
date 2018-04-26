let symbolsConfig    = (typeof symbols    !== 'undefined') ? symbols    : {};
let autotaggerConfig = (typeof autotagger !== 'undefined') ? autotagger : [];
let parser = new TasksParser(symbolsConfig, autotaggerConfig);

if (
	typeof editor !== 'undefined'
	&& typeof context !== 'undefined'
	&& typeof CallbackURL !== 'undefined'
) {
	let text = editor.getSelectedText() || editor.getText();
	let data = parser.parse(text);
	let callback = CallbackURL.create();
	callback.baseURL = 'things:///json';
	callback.addParameter('data', JSON.stringify(data));
	callback.open() || context.fail();
}
