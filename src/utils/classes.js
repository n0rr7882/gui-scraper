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