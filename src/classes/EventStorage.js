export class EventStorage {
    /**
     *
     * @param {Array} events
     * @param {string} entryURL
     * @param {number} tabId
     * @param {boolean} recording
     */
    constructor(events = [], entryURL = null, tabId = null, recording = false) {
        this.events = events;
        this.entryURL = entryURL;
        this.tabId = tabId;
        this.recording = recording;
    }
}

export default EventStorage
