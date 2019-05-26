import {
    // eslint-disable-next-line
    EventInfo,
} from '../classes/EventInfo'
import {
    // eslint-disable-next-line
    EventInfoTarget,
} from "../classes/EventInfoTarget";
import {
    // eslint-disable-next-line
    EventStorage,
} from "../classes/EventStorage";
import {
    removeLastNthOfType
} from '../utils'

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
    'click': convertClick,
    'dblclick': convertParentList,
    'contextmenu': convertRead,
}

/**
 * 
 * @param {EventInfoTarget} target 
 */
export function convertClick(target) {
    return {
        type: 'click',
        css_selector: target.selector,
    }
}

/**
 * 
 * @param {EventInfoTarget} target 
 */
export function convertParentList(target) {
    return {
        type: 'parent_list',
        css_selector: removeLastNthOfType(target.selector, true),
        childs: [
            {
                css_selector: removeLastNthOfType(target.selector),
                inner_attribute: target.attributes.href ? 'href' : 'text',
            }
        ]
    }
}

/**
 * 
 * @param {EventInfoTarget} target 
 */
export function convertRead(target) {
    return {
        type: 'read',
        css_selector: target.selector,
        inner_attribute: target.attributes.href ? 'href' : 'text',
    }
}
