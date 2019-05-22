import { TYPE_SETTINGS } from '../constants'
import { isString } from 'util';

/**
 * 
 * @param {string} selectorString
 * @returns {Array} selected elements
 */
export function selectorToArray(selectorString) {
    if (isString(selectorString)) {
        return selectorString.split('>').map(e => e.trim())
    } else {
        return []
    }
}

/**
 * 
 * @param {string} selectorString
 * @returns {string} selector of leaf element 
 */
export function selectorToLastElement(selectorString) {
    const elements = selectorToArray(selectorString)
    return elements[elements.length - 1]
}

/**
 * 
 * @param {string} actionType
 * @returns {object} color setting set
 */
export function actionTypeToTypeSetting(actionType) {
    if (isString(actionType) && TYPE_SETTINGS[actionType]) {
        return TYPE_SETTINGS[actionType]
    } else {
        return null
    }
}

/**
 * 
 * @param {Element} element 
 */
export function removeAllChildNodes(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild)
    }
}

/**
 * Get this elements CSS Selelctor string
 * @param {Element} element
 * @returns {string}
 */
export function getCssPath(element) {
    if (!(element instanceof Element))
        return;
    var path = [];
    while (element.nodeType === Node.ELEMENT_NODE) {
        var selector = element.nodeName.toLowerCase();
        if (element.id) {
            selector += '#' + element.id;
            path.unshift(selector);
            break;
        } else {
            var sib = element, nth = 1;
            while (sib = sib.previousElementSibling) {
                if (sib.nodeName.toLowerCase() == selector)
                    nth++;
            }
            if (nth != 1)
                selector += ':nth-of-type(' + nth + ')';
        }
        path.unshift(selector);
        element = element.parentNode;
    }
    return path.join(' > ');
}

