/*global chrome*/
import {
    EventInfo,
    EventStorage,
    MessageContext,
} from './utils/classes'
import {
    convertStorage
} from './utils/event-formatter'

const storages = []

/**
 * 
 * @param {object} context 
 */
function createSuccessMsgCtx(context={}) {
    return new MessageContext('res_success', context)
}

/**
 * 
 * @param {object} context 
 */
function createFailedMsgCtx(context={}) {
    return new MessageContext('res_failed', context)
}

function createEmptyStorage(tabId) {
    storages[tabId] = new EventStorage([], null, true)
}

/**
 * @returns {EventStorage}
 */
function getOrCreateStorage(tabId) {
    if (!storages[tabId]) {
        createEmptyStorage(tabId)
    }
    return storages[tabId]
}

/**
 * 
 * @param {EventStorage} storage 
 * @param {string} url 
 */
function setStorageEntryURL(storage, url) {
    if (storage.events.length == 0) {
        storage.entryURL = url
    }
}

/**
 * Receive event from contentscript and append event
 * @param {EventInfo} eventInfo
 * @param {object} sender
 * @param {function} sendResponse
 */
function receventHandler (eventInfo, sender, sendResponse) {
    const storage = getOrCreateStorage(sender.tab.id)
    if (storage.recording) {
        setStorageEntryURL(storage, sender.url)
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
    const storage = getOrCreateStorage(sender.tab.id)
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
    const storage = getOrCreateStorage(message.tabId)
    storage.recording = message.recording
    sendResponse(createSuccessMsgCtx())
}

/**
 * Remove a event storage
 * @param {object} message 
 * @param {object} sender 
 * @param {function} sendResponse
 */
function rmstorageHandler (message, sender, sendResponse) {
    if (storages[message.tabId]) {
        storages[message.tabId] = undefined
        sendResponse(createSuccessMsgCtx())
    } else {
        sendResponse(createFailedMsgCtx({
            message: `EventStorage(tabId: ${message.tabId}) does not exists.`
        }))
    }
}

const HANDLER_LIST = {
    'recevent': receventHandler,
    'reccheck': reccheckHandler,
    'recctrl': recctrlHandler,
    'rmstorage': rmstorageHandler,
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

setInterval(() => console.log(storages ), 1000)
setInterval(() => storages.forEach(s => console.log(convertStorage(s))), 1000)

chrome.extension.onMessage.addListener(rootHandler)
