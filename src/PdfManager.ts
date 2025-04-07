import { readFileSync } from 'fs';
import { PdfData, VerbosityLevel } from 'pdfdataextract';
import AgendaPDFFormatter from "./AgendaPDFFormatter";

export default class PdfManager {

    public static hasStartingChar(input: string): boolean {
        const startChars: string[] = [
            "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "\""
        ]

        for (const char of startChars) {
            if (input.startsWith(char)) return true;
        }

        return false;
    }
}


async function main() {
    const file_data = readFileSync('ExampleAgenda.pdf');
    PdfData.extract(file_data, {
        sort: false,
    }).then((data) => {
        const text = data.text;
        let out: string[] = text?.join().split("\n");
        for (let i = 0; i < out.length; i++) {
            out[i] += "\n";
            if (i > 0) {
                if (!PdfManager.hasStartingChar(out[i])) {
                    out[i-1] = out[i-1].trimEnd();
                }
            }
        }
        console.log(out.join(" "))
        const formatter = new AgendaPDFFormatter(out.join(""))

        console.log(formatter.toHtml())
    })

}

main()