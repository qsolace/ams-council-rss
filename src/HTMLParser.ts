export interface AMSMeeting {
	meetingName: string;
	agendaLink: string;
	supportingDocuments: SupportingDocument[];
}

export interface SupportingDocument {
	text: string;
	link: string;
}

// A class that parses the AMS Agenda, Meetings, and Documents page
//     extracting AMSMeetings
// NOTE: relies on the structure of the AMS Agenda, Meetings and Documents page as of 2025 04 01
export default class HTMLParser {
	public static readonly NO_LINK: string = "[NO LINK FOUND]";
	public static readonly NO_NAME: string = "[NO NAME FOUND]";

	private webpage: any;

	// EFFECTS: creates a parser for the given page
	public constructor(htmlDocument: any) {
		this.webpage = htmlDocument;
	}

	// EFFECTS: returns the parent node of the given HTML node with the given tag (a node is its own parent)
	public static findParentTag(htmlNode: any, tag: string): any | null {
		if (htmlNode.nodeName.includes(tag)) {
			return htmlNode;
		}

		if (htmlNode.nodeName === "#document") {
			return null;
		}

		return HTMLParser.findParentTag(htmlNode.parentNode, tag);
	}

	// EFFECT: returns the first htmlNode in the webpage that has
	//             an inner text field which contains content
	//         deeply traverses the webpage
	public findInnerHTML(content: string): any {
		return this.findInnerHTMLHelper(this.webpage, content);
	}

	// EFFECT: returns the first node in the given htmlNode that has
	//             an inner text field which contains content
	//         deeply traverses htmlNode
	private findInnerHTMLHelper(htmlNode: any, content: string): any {
		if (this.getFirstTextOfCurrentNode(htmlNode).includes(content)) {
			return htmlNode;
		}

		if (!Object.hasOwn(htmlNode, "childNodes")) {
			return null;
		}

		for (const child of htmlNode.childNodes) {
			const childResult = this.findInnerHTMLHelper(child, content);
			if (childResult != null) {
				return childResult;
			}
		}
		return null;
	}

	// EFFECTS: returns the first text field of the current cell, or the empty string if none is found
	public getFirstTextOfCurrentNode(htmlNode: any): string {
		if (!Object.hasOwn(htmlNode, "childNodes")) return "";
		for (const child of htmlNode.childNodes) {
			if (child.nodeName === "#text") {
				return child.value.trim();
			}
		}

		return "";
	}

	// REQUIRES: htmlNode is the <ul> parent node of the AMS documents list
	// EFFECTS: returns all AMS meetings listed within the node
	public parseDocumentList(htmlNode: any): AMSMeeting[] {
		let result = [];
		for (const childNode of htmlNode.childNodes) {
			if (childNode.nodeName === "li") {
				result.push(this.parseDocument(childNode));
			}
		}
		return result;
	}

	// REQUIRES: htmlNode is the <li> parent node of the AMS meeting
	//           htmlNode.childNodes[0] represents the meeting name and agenda
	// EFFECTS:  returns an AMSMeeting associated with the given meeting
	public parseDocument(htmlNode: any): AMSMeeting {
		const firstChildNode = htmlNode.childNodes[0]; //#text or a
		let meetingName: string = HTMLParser.NO_NAME;
		let agendaLink: string = HTMLParser.NO_LINK;
		if (firstChildNode.nodeName === "#text") {
			meetingName = firstChildNode.value;
		} else if (firstChildNode.nodeName === "a") {
			meetingName = firstChildNode.childNodes[0].value;
			agendaLink = firstChildNode.attrs[0].value;
		}

		const supportingDocuments = this.parseSupportingDocuments(this.getChildNodeShallow(htmlNode, "ul")); //ul

		const result: AMSMeeting = {
			agendaLink: agendaLink,
			meetingName: meetingName,
			supportingDocuments: supportingDocuments,
		};
		return result;
	}

	// REQUIRES: htmlNode is the <ul> of a meeting's supporting documents
	// EFFECTS:  returns all SupportingDocuments in htmlNode
	public parseSupportingDocuments(htmlNode: any): SupportingDocument[] {
		let result: SupportingDocument[] = [];
		for (const childNode of htmlNode.childNodes) {
			if (childNode.nodeName != "li") continue;
			result.push(this.parseSupportingDocument(childNode));
		}
		return result;
	}

	// REQUIRES: htmlNode is the <li> of a supporting document
	// EFFECTS:  returns the supporting document in the given htmlNode
	//           name is HTMLParser.NO_NAME and link is HTMLParser.NO_LINK if
	//               the respective values cannot be found
	private parseSupportingDocument(htmlNode: any): SupportingDocument {
		let documentName: string = "";
		let documentLink: string = HTMLParser.NO_LINK;

		for (const child of htmlNode.childNodes) {
			if (child.nodeName === "#text") {
				documentName = documentName + child.value.trim() + " ";
				continue;
			}

			if (child.nodeName === "a") {
				documentName = documentName + child.childNodes[0].value.trim() + " ";
				documentLink = child.attrs[0].value;
			}
		}

		if (documentName.trim() === "") documentName = HTMLParser.NO_NAME;

		return {
			text: documentName,
			link: documentLink,
		};
	}

	// EFFECTS: returns the first child node of htmlNode with the tag nodeName
	//          or null if it cannot be found
	//          only checks the direct children of htmlNode
	private getChildNodeShallow(htmlNode: any, nodeName: string): any | null {
		if (!Object.hasOwn(htmlNode, "childNodes")) return null;

		for (const childNode of htmlNode.childNodes) {
			if (childNode.nodeName === nodeName) return childNode;
		}

		return null;
	}
}
