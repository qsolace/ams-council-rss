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
		this.htmlLines = [];
		for (let i = 0; i < this.rawLines.length; i++) {
			const line = this.rawLines[i];

			if (firstLine && line.trim() != "") {
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
				continue;
			}

			if (line.startsWith(alphaNumeral.next() + ".")) {
				this.htmlLines.push("<h4>" + line + "</h4>");
				alphaNumeral.increment();
				inQuotation = false;
				continue;
			}

			if (!inQuotation && this.isQuoteStart(line) && !this.isQuoteEnd(line)) {
				inQuotation = true;
				this.htmlLines.push("<p>" + line);
				continue;
			}

			if (inQuotation) {
				let ending = "";
				if (this.isQuoteEnd(line)) {
					ending = "</p>";
					inQuotation = false;
				}
				this.htmlLines.push(line + ending);
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

	// EFFECTS: returns true if the line starts with a double quotation mark, false otherwise
	private isQuoteStart(line: string): boolean {
		const quoteStartChars: string[] = ['"', "“"];
		for (let i = 0; i < quoteStartChars.length; i++) {
			if (line.startsWith(quoteStartChars[i])) {
				return true;
			}
		}
		return false;
	}

	// EFFECTS: returns true if the line ends with a double quotation mark, false otherwise
	private isQuoteEnd(line: string): boolean {
		const quoteEndChars: string[] = ['"', "”"];
		for (let i = 0; i < quoteEndChars.length; i++) {
			if (line.trim().endsWith(quoteEndChars[i])) {
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
