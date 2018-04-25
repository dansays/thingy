let prompt = Prompt.create();
prompt.title = 'Select a date...';

let today            = Date.today();
let tomorrow         = Date.today().addDays(1);

let isTodayFriday    = today.is().friday();
let isTomorrowFriday = tomorrow.is().friday();
let isWeekend        = today.is().saturday() || today.is().sunday();

prompt.addButton('Tonight');
prompt.addButton('Tomorrow');

if (!isTodayFriday) {
	if (isWeekend)								prompt.addButton('Next Friday');
	else if (!isTomorrowFriday) 	prompt.addButton('Friday');
}

prompt.addButton(isWeekend ? 'Next Weekend' : 'This Weekend');
prompt.addButton(isWeekend ? 'Monday' : 'Next Week');
prompt.addButton('Other...');

let buttonMap = {
	'Next Week': 'Monday',
	'This Weekend': 'Saturday',
	'Next Weekend': 'Next Saturday',
	'Next Week': 'Monday'
};

if (prompt.show()) {
	let date = prompt.buttonPressed;
	if (date == 'Other...') date = '';
	app.setClipboard(buttonMap[date] || date);
}

else {
	context.cancel();
}
