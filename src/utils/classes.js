import {
    getCssPath
} from '.'

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

/**
 * Formatted HTML element for EventInfo target
 */
export class EventInfoTarget {
    /**
     * 
     * @param {Element} element 
     */
    constructor(element) {

        const attributesFormatted = {}
        for (var key in Object.keys(element.attributes || [])) {
            var attr = element.attributes[key]
            attributesFormatted[attr.name] = attr.value
        }

        this.selector = getCssPath(element)
        this.tag = element.tagName.toLowerCase()
        this.innerText = element.innerText
        this.innerHTML = element.innerHTML
        this.attributes = attributesFormatted
        this.position = element.getBoundingClientRect()
    }
}

export class MessageContext {
    /**
     * 
     * @param {string} msgtype 
     * @param {*} context 
     */
    constructor(msgtype, context={}) {
        this.msgtype = msgtype
        this.context = context
    }

    static convert (message) {
        return new MessageContext(message.msgtype, message.context)
    }
}

export class EventStorage {
    /**
     * 
     * @param {Array} events
     * @param {string} entryURL
     * @param {boolean} recording 
     */
    constructor (events, entryURL, recording) {
        this.events = events
        this.entryURL = entryURL
        this.recording = recording
    }
}
