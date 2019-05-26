/*global chrome*/
import {
    // eslint-disable-next-line
    EventInfo,
    // eslint-disable-next-line
    MessageContext,
} from './classes'
import {
    convertStorage
} from './core/converter'
import {
    createSuccessMsgCtx,
    createFailedMsgCtx,
} from './core/msg-ctx'
import StoragesController from './core/storage'


const STORAGES = []
const storCtrler = new StoragesController(STORAGES)

/**
 * Receive event from contentscript and append event
 * @param {EventInfo} eventInfo
 * @param {object} sender
 * @param {function} sendResponse
 */
function receventHandler (eventInfo, sender, sendResponse) {
    const storage = storCtrler.getOrCreateStorage(sender.tab.id)
    if (storage.recording) {
        StoragesController.setStorageEntryURL(storage, sender.url)
        storage.events.push(eventInfo)
        sendResponse(createSuccessMsgCtx())
    } else {
        sendResponse(createFailedMsgCtx())
    }
}

/**
 * Response recording status
 * @param {*} _
 * @param {object} sender 
 * @param {function} sendResponse 
 */
function reccheckHandler (_, sender, sendResponse) {
    const storage = storCtrler.getOrCreateStorage(sender.tab.id)
    const ctx = { recording: storage.recording }
    sendResponse(createSuccessMsgCtx(ctx))
}

/**
 * Control recording status
 * @param {object} message 
 * @param {object} sender 
 * @param {function} sendResponse
 */
function recctrlHandler (message, sender, sendResponse) {
    const storage = storCtrler.getOrCreateStorage(message.tabId)
    storage.recording = message.recording
    sendResponse(createSuccessMsgCtx())
}

/**
 * Retrieve and remove storages
 * @param {object} message 
 * @param {object} sender 
 * @param {function} sendResponse
 */
function storageHandler (message, sender, sendResponse) {
    switch (message.action) {
        case 'all':
            sendResponse(createSuccessMsgCtx({
                storages: STORAGES
            }))
            break
        case 'get':
            sendResponse(createSuccessMsgCtx({
                storage: storCtrler.findStorage(message.tabId)
            }))
            break
        case 'remove':
            storCtrler.removeStorage(message.tabId)
            sendResponse(createSuccessMsgCtx())
            break
        default:
            sendResponse(createFailedMsgCtx({
                message: `${message.action} is unsupported action types.`
            }))
    }
}

const HANDLER_LIST = {
    'recevent': receventHandler,
    'reccheck': reccheckHandler,
    'recctrl': recctrlHandler,
    'storage': storageHandler,
}

/**
 * 
 * @param {MessageContext} message 
 * @param {*} sender 
 * @param {function} sendResponse 
 */
function rootHandler (message, sender, sendResponse) {
    try {
        HANDLER_LIST[message.msgtype](message.context, sender, sendResponse)
    } catch (e) {
        console.error(`Unexpected Exception raised when receive message type of '${message.msgtype}'.`)
        console.error('message:', message)
        console.error('sender:', sender)
        console.error('error:', e)
    }
}

setInterval(() => console.log(STORAGES), 1000)
setInterval(() => STORAGES.forEach(s => console.log(convertStorage(s))), 1000)

chrome.extension.onMessage.addListener(rootHandler)
