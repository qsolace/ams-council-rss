import HTMLParser, { AMSMeeting } from "./HTMLParser";
import RetrievalManager from "./RetrievalManager";

// generator for the AMS agenda RSS feed
export default class RSSGenerator {
	private static SourceURL = "https://qsolace.github.io/ams-council-rss/feeds/agenda-feed.rss";

	private static header: string =
		'<?xml version="1.0" encoding="UTF-8" ?>\n' +
		'<rss version="2.0"\n' +
		'xmlns:content="http://purl.org/rss/1.0/modules/content/">\n' +
		"\n" +
		"<channel>\n" +
		"  <title>AMS Council Agenda Feed</title>\n" +
		"  <link>https://www.ams.ubc.ca/about-us/student-council/agendas-presentations-minutes/</link>\n" +
		"  <description>A feed that parses the agendas for AMS Council</description>\n";

	private static footer: string = "</channel>  </rss>";

	// EFFECTS: returns a rss feed for the given meetings
	public static async writeFeed(meetings: AMSMeeting[]) {
		let result = "";
		result = result + this.header;
		result = result + this.writeTag("lastBuildDate", new Date().toUTCString());
		for (const meeting of meetings) {
			result += await this.writeItem(meeting);
		}
		result = result + this.footer;
		return result;
	}

	// EFFECTS: returns an <item> for an rss meeting
	public static async writeItem(meeting: AMSMeeting): Promise<string> {
		let result = "";
		result = result + "<item>\n";
		result = result + this.writeTag("title", meeting.meetingName);
		result = result + this.writeTag("guid", meeting.meetingName, 'isPermaLink="false"');
		result = result + this.writeTag("link", this.cleanAgendaLink(meeting.agendaLink));
		result = result + this.writeTag("description", this.writeDescription(meeting));
		result = result + this.writeTag("source", "Qsolace :)", 'url="' + RSSGenerator.SourceURL + '"');
		result = result + this.writeTag("pubDate", this.parseDate(meeting.meetingName));
		result = result + this.writeTag("content:encoded", await this.writeBody(meeting));
		result = result + "</item>\n";
		return result;
	}

	// EFFECT: returns a string corresponding to the date in the title, optionally offset by the given number of days
	public static parseDate(title: string, offsetDays:number = 0): string {
		let reducedInput = title.substring(title.indexOf("–") + 1);
		reducedInput = reducedInput.split("at").join();
		if (reducedInput.includes("pm")) {
			reducedInput = reducedInput.substring(0, reducedInput.indexOf("pm"));
		}
		const result = Date.parse(reducedInput);
		if (isNaN(result)) {
			return new Date().toUTCString();
		} else {
			const date = new Date(result);
			date.setDate(date.getDate() - offsetDays)
			return date.toUTCString();
		}
	}

	// EFFECTS: returns the body of a meeting, including a formatted agenda and a list of supporting documents
	public static async writeBody(meeting: AMSMeeting): Promise<string> {
		let result = "\n<![CDATA[\n";
		if (meeting.agendaLink === HTMLParser.NO_LINK) {
			result += "<h1>" + meeting.meetingName.trim() + "</h1>\n";
			result += "No agenda found.\n";
		} else {
			result += await RetrievalManager.fetchAgenda(meeting.agendaLink);
		}

		result += "<h2>Supporting Documents</h2>\n";
		result += "<ul>\n";
		for (const document of meeting.supportingDocuments) {
			if (document.link === HTMLParser.NO_LINK) {
				result += "<li>" + document.text + "</li>";
			} else {
				result += "<li>" + "<a href='" + document.link + "'>" + document.text + "</a></li>\n";
			}
		}

		result += "</ul>]]>";

		return result;
	}

	// EFFECTS: if link is NO_LINK, returns the default link to the AMS page
	//          otherwise, return link
	private static cleanAgendaLink(link: string): string {
		if (link === HTMLParser.NO_LINK) {
			return RetrievalManager.AMSAgendaLink;
		} else {
			return link;
		}
	}

	// EFFECTS: returns a string representing an HTML/XML tag
	//              the tagname represents the <XXX> --- </XXX>
	//              content represents the string withint the tags <--> XXX </-->
	//              attributes optionally adds attributes to the first tag <--- XXX=XXXXX>
	public static writeTag(tagName: string, content: string, attributes: string = ""): string {
		return "<" + tagName + " " + attributes + ">" + content + "</" + tagName + ">\n";
	}

	private static writeDescription(meeting: AMSMeeting): string {
		let result;
		if (meeting.agendaLink === HTMLParser.NO_LINK) {
			result = "No linked agenda. ";
		} else {
			result = "Successfully linked agenda. ";
		}
		result = result + meeting.supportingDocuments.length + " supporting documents.";

		return result;
	}
}
