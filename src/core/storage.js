import { EventStorage } from "../classes/EventStorage";

export class StoragesController {
    /**
     * 
     * @param {Array<EventStorage>} storages 
     */
    constructor (storages) {
        this.storages = storages
    }

    /**
     * 
     * @param {number} tabId
     * @returns {EventStorage}
     */
    createEmptyStorage(tabId) {
        const storage = new EventStorage()
        StoragesController.setStorageTabId(storage, tabId)
        this.storages.push(storage)
        return storage
    }

    /**
     * 
     * @param {number} tabId
     * @returns {EventStorage}
     */
    findStorage(tabId) {
        return this.storages.find(s => s.tabId === tabId)
    }

    /**
     * 
     * @param {number} tabId 
     */
    removeStorage(tabId) {
        const i = this.storages.findIndex(s => s.tabId === tabId)
        if (i >= 0) {
            this.storages.splice(i, 1)
        }
    }

    /**
     * @returns {EventStorage}
     */
    getOrCreateStorage(tabId) {
        return this.findStorage(tabId) || this.createEmptyStorage(tabId)
    }

    /**
     * 
     * @param {EventStorage} storage 
     * @param {string} url 
     */
    static setStorageEntryURL(storage, url) {
        if (storage.events.length === 0) {
            storage.entryURL = url
        }
    }

    /**
     * 
     * @param {EventStorage} storage 
     * @param {number} tabId 
     */
    static setStorageTabId(storage, tabId) {
        if (storage.events.length === 0) {
            storage.tabId = tabId
        }
    }
}

export default StoragesController
