const prompt = Prompt.create();
prompt.title = 'Select a date...';
prompt.addButton('Tonight');
prompt.addButton('Tomorrow');

const today            = Date.today();
const tomorrow         = Date.today().addDays(1);
const isTodayFriday    = today.is().friday();
const isTomorrowFriday = tomorrow.is().friday();
const isWeekend        = today.is().saturday() || today.is().sunday();

if (!isTodayFriday) {
	if (isWeekend)								prompt.addButton('Next Friday');
	else if (!isTomorrowFriday) 	prompt.addButton('Friday');
}

prompt.addButton(isWeekend ? 'Next Weekend' : 'This Weekend');
prompt.addButton(isWeekend ? 'Monday' : 'Next Week');
prompt.addButton('Other...');

if (prompt.show()) {
	let date = prompt.buttonPressed;
	if (date == 'Other...') date = '';

	const buttonMap = {
		'Next Week': 'Monday',
		'This Weekend': 'Saturday',
		'Next Weekend': 'Next Saturday',
		'Next Week': 'Monday'
	};

	draft.setTemplateTag('pickeddate', buttonMap[date] || date);
	editor.activate();;
}

else {
	context.cancel();
}
