import {
    EventInfo,
    MessageContext,
} from '../classes'

/**
 * To create MessageContext from background.js
 * @param {object} context 
 */
export function createSuccessMsgCtx (context={}) {
    return new MessageContext('res_success', context)
}

/**
 * To create MessageContext from background.js
 * @param {object} context 
 */
export function createFailedMsgCtx (context={}) {
    return new MessageContext('res_failed', context)
}

/**
 * To create MessageContext from contentscript.js
 */
export function createCheckRecMsgCtx () {
    return new MessageContext('reccheck', {})
}

/**
 * To create MessageContext from contentscript.js
 * @param {EventInfo} eventInfo 
 */
export function createRecEventMsgCtx (eventInfo) {
    return new MessageContext('recevent', eventInfo)
}

/**
 * To create MessageContext from popup.js
 * @param {number} tabId 
 * @param {boolean} recording 
 */
export function createRecCtrlMsgCtx (tabId, recording) {
    const ctx = { tabId, recording }
    return new MessageContext('recctrl', ctx)
}

/**
 * To create MessageContext from popup.js
 * @param {string} action 
 * @param {object} context 
 */
export function createStorageMsgCtx (action, context) {
    const ctx = { ...context, action }
    return new MessageContext('storage', ctx)
}
