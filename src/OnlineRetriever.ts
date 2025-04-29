// @ts-ignore
import fetch from "node-fetch";
import { DefaultTreeAdapterMap } from "parse5";
const parse5 = require("parse5");
const crawler = require("crawler-request");

// manages retrieving webpages and PDF files from the internet
export default class OnlineRetriever {
	// EFFECTS: returns the webpage at the given url as a parse5 document
	static async sendHTMLRequest(url: string): Promise<DefaultTreeAdapterMap["document"]> {
		const response = await fetch(url);
		const body = await response.text();
		return parse5.parse(body);
	}

	// EFFECTS: returns the text of the PDF at the given url
	static async sendPDFRequest(url: string): Promise<string> {
		return crawler(url).then(function (response: any): string {
			return response.text;
		});
	}
}
