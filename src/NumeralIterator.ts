export default interface NumeralIterator {
	increment(): void;
	next(): string;
	reset(): string;
}

// iterates through roman numerals
export class RomanIterator implements NumeralIterator {
	private index: number;
	private singleDigitNumerals: string[] = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"];
	private doubleDigitNumerals: string[] = ["", "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC", "C"];

	// EFFECTS: creates a new RomanIterator starting at "I"
	public constructor() {
		this.index = 1;
	}

	// MODIFIES: this
	// EFFECTS:  increments to the next Roman Numeral (such as from IX to X)
	//           resets to I if the current numeral is CX
	public increment(): void {
		this.index = this.index + 1;

		const endOfRomanNumerals: number = 111;
		if (this.index === endOfRomanNumerals) this.reset();
	}

	// EFFECTS: returns the current roman numeral
	public next(): string {
		const tensDigit: number = Math.floor(this.index / 10);
		const onesDigit: number = this.index % 10;

		const tensNumeral: string = this.doubleDigitNumerals[tensDigit];
		const onesNumeral: string = this.singleDigitNumerals[onesDigit];
		return tensNumeral.concat(onesNumeral);
	}

	// MODIFIES: this
	// EFFECTS:  resets the RomanIterator to I and returns the current numeral
	public reset(): string {
		const temp = this.index;
		this.index = 1;
		return temp.toString();
	}
}

// iterates up the alphabet with capital letters
export class AlphabetIterator implements NumeralIterator {
	private index: number;

	// EFFECTS: creates a new AlphabetIterator starting at A
	public constructor() {
		this.index = 1;
	}

	// MODIFIES: this
	// EFFECTS:  increments to the next letter (such as from C to D)
	//           resets to A if the current letter is Z
	public increment(): void {
		const endOfCapitalLetters: number = 27;
		this.index = this.index + 1;
		if (this.index === endOfCapitalLetters) this.reset();
	}

	// EFFECTS: returns the current letter
	public next(): string {
		const offsetToCapitalLetters: number = 64;
		const letter = String.fromCharCode(this.index + offsetToCapitalLetters);
		return letter;
	}

	// MODIFIES: this
	// EFFECTS: resets the AlphabetIterator to A and returns the character of the current letter
	public reset(): string {
		const temp = this.next();
		this.index = 1;
		return temp;
	}
}
