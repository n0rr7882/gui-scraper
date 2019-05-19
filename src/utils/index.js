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