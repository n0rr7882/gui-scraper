import {
    EventInfo,
} from '../classes/EventInfo'
import { EventInfoTarget } from "../classes/EventInfoTarget";
import { EventStorage } from "../classes/EventStorage";

/**
 * 
 * @param {EventStorage} storage 
 */
export function convertStorage(storage) {
    return {
        entry_point: storage.entryURL,
        process: convertEventList(storage.events)
    }
}

/**
 * 
 * @param {Array<EventInfo>} events 
 */
export function convertEventList(events) {
    return events.map(eventInfo => {
        return convertEventItem(eventInfo)
    })
}

/**
 * 
 * @param {EventInfo} eventInfo 
 */
export function convertEventItem(eventInfo) {
    return CONVERTER_LIST[eventInfo.type](eventInfo.target)
}

const CONVERTER_LIST = {
    'click': convertClickEvent,
    'contextmenu': convertReadEvent
}

/**
 * 
 * @param {EventInfoTarget} target 
 */
export function convertClickEvent(target) {
    return {
        type: 'click',
        css_selector: target.selector
    }
}

/**
 * 
 * @param {EventInfoTarget} target 
 */
export function convertReadEvent(target) {
    return {
        type: 'read',
        css_selector: target.selector,
        inner_attribute: target.attributes.href ? 'href' : 'text'
    }
}
