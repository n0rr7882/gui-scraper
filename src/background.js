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

/**
 * 
 * @param {number} tabId
 * @returns {EventStorage}
 */
function createEmptyStorage(tabId) {
    const storage = new EventStorage()
    setStorageTabId(storage, tabId)
    storages.push(storage)
    return storage
}

/**
 * 
 * @param {number} tabId
 * @returns {EventStorage}
 */
function findStorage(tabId) {
    return storages.find(s => s.tabId === tabId)
}

/**
 * 
 * @param {number} tabId 
 */
function removeStorage(tabId) {
    const i = storages.findIndex(s => s.tabId === tabId)
    if (i >= 0) {
        storages.splice(i, 1)
    }
}

/**
 * @returns {EventStorage}
 */
function getOrCreateStorage(tabId) {
    return findStorage(tabId) || createEmptyStorage(tabId)
}

/**
 * 
 * @param {EventStorage} storage 
 * @param {string} url 
 */
function setStorageEntryURL(storage, url) {
    if (storage.events.length === 0) {
        storage.entryURL = url
    }
}

/**
 * 
 * @param {EventStorage} storage 
 * @param {number} tabId 
 */
function setStorageTabId(storage, tabId) {
    if (storage.events.length === 0) {
        storage.tabId = tabId
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
function storageHandler (message, sender, sendResponse) {
    switch (message.action) {
        case 'all':
            sendResponse(createSuccessMsgCtx({
                storages
            }))
            break
        case 'get':
            sendResponse(createSuccessMsgCtx({
                storage: findStorage(message.tabId)
            }))
            break
        case 'remove':
            removeStorage(message.tabId)
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

setInterval(() => console.log(storages ), 1000)
setInterval(() => storages.forEach(s => console.log(convertStorage(s))), 1000)

chrome.extension.onMessage.addListener(rootHandler)
