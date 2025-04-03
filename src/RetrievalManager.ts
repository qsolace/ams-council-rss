import OnlineRetriever from "./OnlineRetriever";
import HTMLParser, { AMSMeeting } from "./HTMLParser";
import AgendaPDFFormatter from "./AgendaPDFFormatter";

// manages calls to the AMS website
export default class RetrievalManager {
	public static AMSAgendaLink: string =
		"https://www.ams.ubc.ca/about-us/student-council/agendas-presentations-minutes/";

	// EFFECTS: returns all AMSMeetings found on the AMS Website
	public static async fetchMeetingDocumentList(): Promise<AMSMeeting[]> {
		const page = await OnlineRetriever.sendHTMLRequest(this.AMSAgendaLink);
		const parser = new HTMLParser(page);
		const allMeetings = parser.findInnerHTML("Council Agenda").parentNode;

		return parser.parseDocumentList(allMeetings);
	}

	// REQUIRES: link is a hyperlink to an AMS Agenda
	// EFFECTS: returns the agenda at the given link as HTML
	public static async fetchAgenda(link: string): Promise<string> {
		let raw: string = await OnlineRetriever.sendPDFRequest(link);
		const formater = new AgendaPDFFormatter(raw);

		return formater.toHtml();
	}
}
