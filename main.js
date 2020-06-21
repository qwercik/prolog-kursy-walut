const session = pl.create(1000)
const callback = answer => console.log(pl.format_answer(answer))

session.consult(`
	:- use_module(library(dom)).
	:- use_module(library(random)).
	:- use_module(library(js)).



	format_currency_entry(From, To, Rate, Result) :-
		atomic_list_concat([To, ': ', Rate, ' ', From], Result)
	.

	format_currency_error_entry(From, To, ErrorMessage) :-
		atomic_list_concat(['Nie udało się uzyskać kursu z ', From, ' na ', To], ErrorMessage)
	.

	create_api_request_url(From, To, Result) :-
		atomic_list_concat(['https://api.exchangeratesapi.io/latest?base=', To, '&symbols=', From], Result)
	.



	obtain_exchange_rate(From, To, Rate) :-
		create_api_request_url(From, To, Url),
		ajax(get, Url, Json),
		json_prolog(Json, ParsedJson),
		ParsedJson=[-(rates, [-(From, Rate)]) | _]
	.

	round_exchange_rate(Rate, Rounded) :-
		Rounded is round(Rate * 100) / 100
	.

	number_as_identifier(Num, Identifier) :-
		number_chars(Num, Chars),
		atomic_list_concat(Chars, Identifier)
	.



	create_entry(Element, Class) :-
		create('li', Currency),
		set_attr(Currency, 'class', Class),
		set_html(Currency, Element),
		get_by_id('currencies', Currencies),
		append_child(Currencies, Currency)
	.
		
	create_currency_entry(From, To) :-
		obtain_exchange_rate(From, To, Rate),
		round_exchange_rate(Rate, RoundedRate),

		number_as_identifier(RoundedRate, RoundedRateIdentifier),
		format_currency_entry(From, To, RoundedRateIdentifier, FormattedResult),

		create_entry(FormattedResult, 'currency')
	.

	create_currency_error_entry(From, To) :-
		format_currency_error_entry(From, To, ErrorMessage),
		create_entry(ErrorMessage, 'currency currency-error')
	.



	create_entries([], []) :- !.
	create_entries([[From, To] | Tail]) :-
		create_currency_entry(From, To),
		!,
		create_entries(Tail)
	.

	create_entries([[From, To] | Tail]) :-
		create_currency_error_entry(From, To),
		create_entries(Tail)
	.

	init :-
		create_entries([
			['PLN', 'USD'],
			['PLN', 'EUR'],
			['PLN', 'GBP'],
			['PLN', 'CZK'],
			['PLN', 'CHF']
		])
	.
`)

session.query("init.")
session.answers(() => {})
