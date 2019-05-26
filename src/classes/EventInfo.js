import EventInfoTarget from './EventInfoTarget';

/**
 * Formatted HTML element's Event
 */
export class EventInfo {
    /**
     * 
     * @param {Event} event 
     */
    constructor(event) {
        this.type = event.type
        this.target = new EventInfoTarget(event.target)
    }
}

export default EventInfo
