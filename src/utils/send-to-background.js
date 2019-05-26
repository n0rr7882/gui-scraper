/*global chrome*/
import { MessageContext } from "../classes/MessageContext";

/**
 * Send message to background.js on chrome extension
 * @param {MessageContext} messageContext
 * @returns {Promise<MessageContext>}
 */
export function sendToBackground(messageContext) {
    return new Promise((resolve, reject) => {
        chrome.extension.sendMessage(messageContext, res => {
            const resMsgCtx = MessageContext.convert(res)
            if (resMsgCtx.msgtype === 'res_success') {
                resolve(resMsgCtx)
            } else {
                reject(resMsgCtx)
            }
        })
    })
}

export function errorLogger(errorMessageContext) {
    console.error('Error received:', errorMessageContext)
}

export default sendToBackground