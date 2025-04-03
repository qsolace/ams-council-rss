import RSSGenerator from "./RSSGenerator";
import fs from "fs";
import RetrievalManager from "./RetrievalManager";

async function main() {
    const documents = await RetrievalManager.fetchMeetingDocumentList();

    // const data = await RetrievalManager.fetchAgenda(documents[2].agendaLink);
    const data = await RSSGenerator.writeFeed(documents);
    fs.writeFile("out.rss", data, (err: any) => {
        // In case of a error throw err.
        if (err) throw err;
    });
}

main();