import { getCssPath } from '../utils';
/**
 * Formatted HTML element for EventInfo target
 */
export class EventInfoTarget {
    /**
     *
     * @param {Element} element
     */
    constructor(element) {
        const attributesFormatted = {};
        for (var key in Object.keys(element.attributes || [])) {
            var attr = element.attributes[key];
            attributesFormatted[attr.name] = attr.value;
        }
        this.selector = getCssPath(element);
        this.tag = element.tagName.toLowerCase();
        this.innerText = element.innerText;
        this.innerHTML = element.innerHTML;
        this.attributes = attributesFormatted;
        this.position = element.getBoundingClientRect();
    }
}

export default EventInfoTarget
