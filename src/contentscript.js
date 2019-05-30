import {
    createCheckRecMsgCtx,
    createRecEventMsgCtx,
} from './core/msg-ctx'
import {
    removeAllChildNodes,
    removeLastNthOfType,
    selectorToLastElement,
} from './utils'
import {
    EventInfo,
} from './classes'
import {
    errorLogger,
    sendToBackground,
} from './utils/send-to-background'

import './contentscript.scss'

// To handle each event differently
const SHOULD_BE_RECORDED_EVENT_HANDLERS = {
    'click': handleClick,
    'contextmenu': handleContextmenu,
}

// Events to record
const SHOULD_BE_RECORDED_EVENTS = Object.keys(SHOULD_BE_RECORDED_EVENT_HANDLERS)

// Events that should indicate element position
const SHOULD_BE_POINTED_EVENTS = [
    ...SHOULD_BE_RECORDED_EVENTS,
    'mousemove',
    'wheel'
]

// When scaper starts recording, this var will be set true
let RECORDING = false

// To distinguish between contextmenu and double contextmenu
let CONTEXTMENU_CLICK_COUNT = 0

/**
 * Create new EventInfo and return it.
 * @param {Event} e
 * @returns {EventInfo}
 */
function getEventInfo(e) {
    return new EventInfo(e)
}

/**
 * Send EventInfo to background.js on chrome extension
 * @param {EventInfo} eventInfo 
 */
function sendEventToBackground(eventInfo) {
    const newMsgCtx = createRecEventMsgCtx(eventInfo)
    sendToBackground(newMsgCtx).then(resMsgCtx => {
        console.log('Response from background.js:', resMsgCtx)
    }).catch(errorLogger)
}

/**
 * Create new empty InfoBox and return it.
 * @returns {Element}
 */
function createInfoBox() {
    // new InfoBox
    const infoBox = document.createElement('div')
    infoBox.setAttribute('id', 'guiScraperInfoBoxElement')
    return infoBox
}

/**
 * Return existed InfoBox on Document or create empty InfoBox and return it.
 * @returns {Element}
 */
function getOrCreateInfoBox() {
    let infoBox = document.getElementById('guiScraperInfoBoxElement')
    if (!infoBox) {
        infoBox = createInfoBox()
    }
    return infoBox
}

/**
 * Create new InfoBoxContent element and return it.
 * InfoBoxContent element will be contained to InfoBox
 * @param {EventInfo} eventInfo
 * @returns {Element} 
 */
function createInfoBoxContent(eventInfo) {
    // target attribute object to array of name and value.
    const targetAttributes = Object.keys(eventInfo.target.attributes || []).map(name => {
        return { name, value: eventInfo.target.attributes[name] }
    })

    // to display target's innerText into InfoBox.
    const minimalizedInnerText = eventInfo.target.innerText ? (
        eventInfo.target.innerText.length > 60
            ? eventInfo.target.innerText.substring(0, 60) + '...'
            : eventInfo.target.innerText
    ) : ''

    // return new InfoBoxContent with new event info.
    const infoBoxContent = document.createElement('div')
    infoBoxContent.setAttribute('id', 'guiScraperInfoBoxContent')

    // title
    const infoBoxTitle = document.createElement('h3')
    infoBoxTitle.setAttribute('class', 'gsib-content-title')
    infoBoxTitle.innerText = selectorToLastElement(eventInfo.target.selector)

    // subtitle
    const infoBoxSubtitle = document.createElement('p')
    infoBoxSubtitle.setAttribute('class', 'gsib-content-subtitle')
    infoBoxSubtitle.innerText = minimalizedInnerText

    // attribute list
    const infoBoxAttrList = document.createElement('ul')
    infoBoxAttrList.setAttribute('class', 'gisb-content-attr-list')

    for (const attr of targetAttributes) {
        // attribute item
        const attrItem = document.createElement('li')

        // attribute name
        const attrName = document.createElement('b')
        attrName.innerText = `${attr.name}: `

        // attribute value
        const attrValue = document.createElement('code')
        attrValue.innerText = attr.value

        attrItem.appendChild(attrName)
        attrItem.appendChild(attrValue)

        // attach into infoBoxAttrList
        infoBoxAttrList.appendChild(attrItem)
    }

    // assemble infoBoxContent
    infoBoxContent.appendChild(infoBoxTitle)
    infoBoxContent.appendChild(infoBoxSubtitle)
    infoBoxContent.appendChild(infoBoxAttrList)

    return infoBoxContent
}

/**
 * Update infoBox's content into newInfoBoxContent
 * @param {Element} infoBox 
 * @param {Element} newInfoBoxContent 
 */
function updateInfoBox(infoBox, newInfoBoxContent) {
    removeAllChildNodes(infoBox)
    infoBox.appendChild(newInfoBoxContent)
}

/**
 * Get or create InfoBox and update attribute from new eventInfo
 * @param {EventInfo} eventInfo 
 */
function renderInfoBox(eventInfo) {
    const infoBox = getOrCreateInfoBox()
    const infoBoxContent = createInfoBoxContent(eventInfo)
    updateInfoBox(infoBox, infoBoxContent)

    // attatch to PointingBox
    const pointingBox = getOrCreatePointingBox()
    if (!pointingBox.firstChild) {
        pointingBox.appendChild(infoBox)
    }
}

/**
 * Create new PointingBox and return it.
 * @param {string|number} identifier
 * @returns {Element}
 */
function createPointingBox(identifier = 'default') {
    const pointingBox = document.createElement('div')
    pointingBox.id = `guiScraperPointingElement_${identifier}`
    pointingBox.classList.add('guiScraperPointingElement')
    return pointingBox
}

/**
 * Return existed PointingBox on DOM or create and return it.
 * @param {string|number} identifier
 * @returns {Element}
 */
function getOrCreatePointingBox(identifier = 'default') {
    let pointingBox = document.getElementById(`guiScraperPointingElement_${identifier}`)
    if (!pointingBox) {
        pointingBox = createPointingBox(identifier)
        document.body.appendChild(pointingBox)
    }
    return pointingBox
}

/**
 * Set position of PointingBox
 * @param {Element} pointingBox 
 * @param {ClientRect} position 
 */
function setPointingBoxPosition(pointingBox, position) {
    pointingBox.style.top = position.top + 'px'
    pointingBox.style.left = position.left + 'px'
    pointingBox.style.width = position.width + 'px'
    pointingBox.style.height = position.height + 'px'
}

/**
 * Set class attributes of PointingBox
 * @param {Element} pointingBox 
 * @param {string} eventType 
 */
function setPointingBoxEventStatus(pointingBox, eventType) {
    if (SHOULD_BE_RECORDED_EVENTS.includes(eventType)) {
        pointingBox.classList.add(eventType)
    } else if (pointingBox.classList.length !== 1) {
        pointingBox.setAttribute('class', 'guiScraperPointingElement')
    }
}

/**
 * Get or create pointingBox and update attribute from new eventInfo
 * @param {EventInfo} eventInfo 
 */
function renderPointingBox(eventInfo, identifier = 'default') {
    const position = eventInfo.target.position
    const pointingBox = getOrCreatePointingBox(identifier)
    setPointingBoxPosition(pointingBox, position)
    setPointingBoxEventStatus(pointingBox, eventInfo.type)
}

/**
 * 
 * @param {EventInfo} eventInfo 
 */
function createParentEventInfo(eventInfo) {
    const parentSelector = removeLastNthOfType(eventInfo.target.selector, true)
    const parentElement = document.querySelector(parentSelector)
    const event = new Event('parent_element')
    // set manually created event's target to parent element
    Object.defineProperty(event, 'target', { writable: false, value: parentElement })
    return new EventInfo(event)
}

/**
 * Get or 
 * @param {EventInfo} eventInfo 
 */
function renderParentPointingBox(eventInfo) {
    const parentEventInfo = createParentEventInfo(eventInfo)
    renderPointingBox(parentEventInfo, 'parent_element')
}

/**
 * Remove PointingBox from DOM
 * @param {string|number} identifier
 */
function removePointingBox(identifier = 'default') {
    const pointingBox = document.getElementById(`guiScraperPointingElement_${identifier}`)
    if (pointingBox) {
        pointingBox.remove()
    }
}

/**
 * Disable/Enable Context menu (mouse right click)
 * @param {boolean} enable 
 */
function setContextMenu(enable) {
    if (enable) {
        document.body.removeAttribute('oncontextmenu')
    } else {
        document.body.setAttribute('oncontextmenu', 'return false;')
    }
}

/**
 * 
 * @param {EventInfo} eventInfo 
 */
function handleClick(eventInfo) {
    sendEventToBackground(eventInfo)
}

/**
 * 
 * @param {EventInfo} eventInfo 
 */
function handleContextmenu(eventInfo) {
    // To distinguish between contextmenu and double contextmenu
    CONTEXTMENU_CLICK_COUNT += 1
    // To distinguish whether another contextmenu event is running
    if (CONTEXTMENU_CLICK_COUNT == 1) {
        const contextmenu_click_count = CONTEXTMENU_CLICK_COUNT
        setTimeout(() => {
            if (CONTEXTMENU_CLICK_COUNT > contextmenu_click_count) {
                // set event type to custom type 'dblcontextmenu' force
                eventInfo.type = 'dblcontextmenu'
                sendEventToBackground(eventInfo)
            } else {
                // just single contextmenu event
                sendEventToBackground(eventInfo)
            }
            CONTEXTMENU_CLICK_COUNT = 0
        }, 250)
    }
}

/**
 * This event handler will send information about event
 * to background.js on chrome extension
 * @param {Event} e 
 */
function record(e) {
    if (RECORDING) {
        const eventInfo = getEventInfo(e)
        SHOULD_BE_RECORDED_EVENT_HANDLERS[e.type](eventInfo)
    }
}

/**
 * This event handler will rerender PointingBox
 * with new information based on new event
 * @param {Event} e 
 */
function point(e) {
    if (RECORDING) {
        const eventInfo = getEventInfo(e)
        // render pointing box point to element and its parent
        renderPointingBox(eventInfo)
        renderParentPointingBox(eventInfo)
        // render info box that show pointed element's informations
        renderInfoBox(eventInfo)
    } else {
        removePointingBox()
        removePointingBox('parent_element')
    }
    // Disable Context menu when on recording
    setContextMenu(!RECORDING)
}

// check recording status from background.js and update
setInterval(() => {
    const newMsgCtx = createCheckRecMsgCtx()
    sendToBackground(newMsgCtx).then(resMsgCtx => {
        RECORDING = resMsgCtx.context.recording
    }).catch(errorLogger)
}, 100)

// Set event handlers
SHOULD_BE_RECORDED_EVENTS.forEach(e => document.addEventListener(e, record))
SHOULD_BE_POINTED_EVENTS.forEach(e => document.addEventListener(e, point))
