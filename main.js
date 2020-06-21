const session = pl.create(1000)
const callback = answer => console.log(pl.format_answer(answer))

session.consult(`
	:- use_module(library(dom)).
	:- use_module(library(random)).
	:- use_module(library(js)).

	format_currency_entry(From, To, Rate, Result) :-
		atom_concat(To, ': ', Temp1),
		atom_concat(Temp1, Rate, Temp2),
		atom_concat(Temp2, ' ', Temp3),
		atom_concat(Temp3, From, Result)
	.

	create_api_request_url(From, To, Result) :-
		atom_concat('https://api.exchangeratesapi.io/latest?base=', To, Temp1),
		atom_concat(Temp1, '&symbols=', Temp2),
		atom_concat(Temp2, From, Result)
	.

	obtain_exchange_rate(From, To, Rate) :-
		create_api_request_url(From, To, Url),
		ajax(get, Url, Json),
		json_prolog(Json, ParsedJson),
		ParsedJson=[-(rates, [-(From, Rate)]) | _]
	.
		

	create_currency_entry(From, To) :-
		create('li', Currency),
		set_attr(Currency, 'class', 'currency'),

		obtain_exchange_rate(From, To, Rate),
		RoundedRate is round(Rate * 100) / 100,

		number_chars(RoundedRate, Temp1),
		atomic_list_concat(Temp1, RoundedRateString),

		format_currency_entry(From, To, RoundedRateString, FormattedResult),

		set_html(Currency, FormattedResult),
		get_by_id('currencies', Currencies),
		append_child(Currencies, Currency)
	.

	init :-
		create_currency_entry('PLN', 'USD'),
		create_currency_entry('PLN', 'EUR'),
		create_currency_entry('PLN', 'GBP'),
		create_currency_entry('PLN', 'CHF')
	.
`)

session.query("init.")
session.answers(() => {})

