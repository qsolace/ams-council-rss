import OnlineRetriever from "./OnlineRetriever";
import HTMLParser, { AMSMeeting } from "./HTMLParser";
import AgendaPDFFormatter from "./AgendaPDFFormatter";
import fs from "fs/promises";

// manages calls to the AMS website
export default class RetrievalManager {
	public static AMSAgendaLink: string =
		"https://www.ams.ubc.ca/about-us/student-council/agendas-presentations-minutes/";

	// EFFECTS: returns all AMSMeetings found on the AMS Website
	public static async fetchMeetingDocumentList(): Promise<AMSMeeting[]> {
		const page = await OnlineRetriever.sendHTMLRequest(this.AMSAgendaLink);
		const parser = new HTMLParser(page);
		let allMeetings;
		try {
			allMeetings = HTMLParser.findParentTag(parser.findInnerHTML("Council Agenda"), "ul");
		} catch (e) {
			return [];
		}

		return parser.parseDocumentList(allMeetings);
	}

	// REQUIRES: link is a hyperlink to an AMS Agenda
	// EFFECTS: returns the agenda at the given link as HTML
	public static async fetchAgenda(link: string): Promise<string> {
		let raw: string = await OnlineRetriever.sendPDFRequest(link);
		const formater = new AgendaPDFFormatter(raw);

		return formater.toHtml();
	}

	// REQUIRES: an agenda feed with a well-formed buildDate is at ./feeds/agenda-feed.rss
	public static async hasUpdatedSinceLastBuild(): Promise<boolean> {
		let buildDate = await fs
			.readFile("../feeds/agenda-feed.rss", "utf-8")
			.then((data) => {
				const startKey = "<lastBuildDate >";
				const endKey = "</lastBuildDate>";
				const textDate = data.substring(data.indexOf(startKey) + startKey.length, data.lastIndexOf(endKey));
				return new Date(textDate);
			})
			.catch(() => {
				const earliestDate = -8640000000000000;
				return new Date(earliestDate);
			});

		const pageDate = await OnlineRetriever.sendFileRequest(this.AMSAgendaLink + "/rss").then((data) => {
			const startKey = "<lastBuildDate>";
			const endKey = "</lastBuildDate>";
			const textDate = data.substring(data.indexOf(startKey) + startKey.length, data.lastIndexOf(endKey));
			return new Date(textDate);
		});

		return pageDate.getTime() > buildDate.getTime();
	}
}
