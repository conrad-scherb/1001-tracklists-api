import Log from "@frasermcc/log";
import axios, { AxiosResponse } from "axios";
import cheerio from "cheerio";

// Takes a tracklist URL and a track ID, then returns the track IDs of the adjacent tracks.
export async function findAdjacentTracks(tracklistURL: string, trackID: string): Promise<string[] | undefined> {
    if (!tracklistURL.startsWith("https://www.1001tracklists.com/tracklist/")) {
        tracklistURL = "https://www.1001tracklists.com/tracklist/" + tracklistURL;
    }

    const AxiosInstance = axios.create();
    const response = await AxiosInstance.get(tracklistURL).catch(error => {
        if (error.response) {
            Log.warn(`The tracklist was not found (error code ${error.response.status})`);
        }
    });

    if (response === undefined) {
        return undefined;
    }

    const html = (response as AxiosResponse).data;
    const pageHTML = cheerio.load(html);

    const tracksTable = pageHTML("#tlTab")
    const inputTrackNumber = parseInt(tracksTable.find(`*[data-trackid = '${trackID}']`).attr("data-trno") ?? "-2");

    // Get the previous track
    const previousTrackID = tracksTable.find(`*[data-trno = '${inputTrackNumber - 1}']`).attr("data-trackid");
    const nextTrackID = tracksTable.find(`*[data-trno = '${inputTrackNumber + 1}']`).attr("data-trackid");

    let output: string[] = [];

    if (previousTrackID !== undefined) {
        output.push(previousTrackID);
    }

    if (nextTrackID !== undefined) {
        output.push(nextTrackID);
    }

    return output
}