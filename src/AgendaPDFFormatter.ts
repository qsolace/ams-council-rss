import NumeralIterator, { RomanIterator, AlphabetIterator } from "./NumeralIterator";
interface ReplacementPair {
	toReplace: string;
	replacement: string;
}

// produces an html version of an AMS Agenda PDF raw text input
// NOTE: relies on the structure of the Agenda PDFs as of 2025 04 01
export default class AgendaPDFFormatter {
	private pdfText: string;
	public rawLines: string[];
	public htmlLines: string[];

	// EFFECTS: initializes a formatter with the given text
	public constructor(pdfText: string) {
		this.pdfText = pdfText;
		this.rawLines = this.pdfText.split("\n");
		this.htmlLines = [];
	}

	// EFFECTS: formats the Agenda PDF into HTML
	// TODO: format this method more reasonably. Possibly a "state" field???
	public toHtml() {
		const romanNumeral: NumeralIterator = new RomanIterator();
		const alphaNumeral: NumeralIterator = new AlphabetIterator();
		let firstLine: boolean = true;
		let firstAgenda: boolean = true;
		let inQuotation: boolean = false;
		let inParenthesis: boolean = false;
		this.htmlLines = [];
		for (let i = 0; i < this.rawLines.length; i++) {
			const line = this.rawLines[i];

			if (line.trim() === "") continue;

			if (firstLine) {
				firstLine = false;
				this.htmlLines.push("<h1>" + line + "</h1>");
				continue;
			} else if (firstLine) {
				continue;
			}

			if (firstAgenda && line.startsWith("Agenda")) {
				firstAgenda = false;
				this.htmlLines.push("<h2>" + line + "</h2>");
				continue;
			}

			if (line.startsWith(romanNumeral.next() + ".")) {
				this.htmlLines.push("<h3>" + line + "</h3>");
				romanNumeral.increment();
				alphaNumeral.reset();
				inQuotation = false;
				inParenthesis = false;
				continue;
			}

			if (line.startsWith(alphaNumeral.next() + ".")) {
				this.htmlLines.push("<h4>" + line + "</h4>");
				alphaNumeral.increment();
				inQuotation = false;
				inParenthesis = false;
				continue;
			}

			if (!inQuotation && this.isQuoteStart(line) && !this.isQuoteEnd(line)) {
				inQuotation = true;
				this.htmlLines.push("<p>" + line);
				continue;
			}

			if (!this.isCompleteParenthetical(line) && this.isParentheticalStart(line)) {
				inParenthesis = true;
				this.htmlLines.push("<p>" + line);
				continue;
			}

			if (inQuotation || inParenthesis) {
				let ending = "";
				if (this.isQuoteEnd(line) || this.isParentheticalEnd(line)) {
					ending = "</p>";
					inQuotation = false;
					inParenthesis = false;
				}
				this.htmlLines.push(line + ending);
				continue;
			}

			if (this.isInitialLowercase(line) && this.htmlLines.length != 0) {
				let previous:string;
				try {
					previous = <string>this.htmlLines.pop()
				} catch (_) {
					previous = ""
				}
				let resultLine: string = previous.split("</p>")[0]
				resultLine+= line + "</p>"
				this.htmlLines.push(resultLine)
				continue;
			}


			this.htmlLines.push("<p>" + line + "</p>");
		}
		this.cleanIllegalCharacters();
		return this.collapseArray(this.htmlLines);
	}

	// MODIFIES: this
	// EFFECTS: replaces characters that will render poorly in this PDF
	private cleanIllegalCharacters() {
		const charsToRemove: ReplacementPair[] = [
			{ toReplace: " ", replacement: " " },
			{ toReplace: "“", replacement: '"' },
			{ toReplace: "”", replacement: '"' },
			{ toReplace: "‘", replacement: "'" },
			{ toReplace: "’", replacement: "'" },
			{ toReplace: "—", replacement: "-" },
		];

		for (let i = 0; i < this.htmlLines.length; i++) {
			let htmlLine: string = this.htmlLines[i];
			for (const pair of charsToRemove) {
				htmlLine = htmlLine.split(pair.toReplace).join(pair.replacement);
			}
			this.htmlLines[i] = htmlLine;
		}
	}

	private isInitialLowercase(line: string): boolean {
		return line.charAt(0) != line.charAt(0).toUpperCase();
	}

	// EFFECTS: returns true if the line starts with a double quotation mark, false otherwise
	private isQuoteStart(line: string): boolean {
		const quoteStartChars: string[] = ['"', "“"];
		return this.isStart(line, quoteStartChars);
	}

	// EFFECTS: returns true if the line ends with a double quotation mark, false otherwise
	private isQuoteEnd(line: string): boolean {
		const quoteEndChars: string[] = ['"', "”"];
		return this.isEnd(line, quoteEndChars);
	}

	private isCompleteParenthetical(line: string): boolean {
		return this.isParentheticalStart(line) && this.isParentheticalEnd(line)
	}

	// EFFECTS: returns true if the line contains an open parenthesis or bracket, false otherwise
	private isParentheticalStart(line: string): boolean {
		const parentheticalStartChars: string[] = ['(', "["];
		for (const char of parentheticalStartChars) {
			if (line.includes(char)) return true;
		}
		return false;
	}

	// EFFECTS: returns true if the line contains a closing parenthesis or bracket, false otherwise
	private isParentheticalEnd(line: string): boolean {
		const parentheticalEndChars: string[] = [')', "]"];
		for (const char of parentheticalEndChars) {
			if (line.includes(char)) return true;
		}
		return false;
	}

	private isEnd(line: string, matchings: string[]): boolean {
		for (let i = 0; i < matchings.length; i++) {
			if (line.trim().endsWith(matchings[i])) {
				return true;
			}
		}
		return false;
	}

	private isStart(line: string, matchings: string[]): boolean {
		for (let i = 0; i < matchings.length; i++) {
			if (line.startsWith(matchings[i])) {
				return true;
			}
		}
		return false;
	}

	// EFFECTS: concatenates input, each separated by a new line
	private collapseArray(input: string[]) {
		let result: string = "";
		for (const line of input) {
			result = result + line + "\n";
		}
		return result;
	}
}
