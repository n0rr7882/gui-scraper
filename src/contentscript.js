import {
    removeAllChildNodes,
    selectorToLastElement,
} from './utils'
import {
    EventInfo,
    MessageContext,
} from './utils/classes'
import {
    errorLogger,
    sendToBackground,
} from './utils/send-to-background'

import './contentscript.scss'

const SHOULD_BE_RECORDED_EVENTS = [
    'click',
    'contextmenu',
    // 'keypress',
]
const SHOULD_BE_POINTED_EVENTS = [
    ...SHOULD_BE_RECORDED_EVENTS,
    'mousemove',
    'wheel'
]

/**
 * Create MessageContext to send chrome extension background.js
 */
function createCheckRecMsgCtx () {
    return new MessageContext('reccheck', {})
}

/**
 * Create MessageContext to send chrome extension background.js
 * @param {EventInfo} eventInfo 
 */
function createRecEventMsgCtx (eventInfo) {
    return new MessageContext('recevent', eventInfo)
}

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
 * @returns {Element}
 */
function createPointingBox() {
    const pointingBox = document.createElement('div')
    pointingBox.setAttribute('id', 'guiScraperPointingElement')
    return pointingBox
}

/**
 * Return existed PointingBox on Document or create and return it.
 * @returns {Element}
 */
function getOrCreatePointingBox() {
    let pointingBox = document.getElementById('guiScraperPointingElement')
    if (!pointingBox) {
        pointingBox = createPointingBox()
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
 * Set color of PointingBox
 * @param {Element} pointingBox 
 * @param {string} eventType 
 */
function setPointingBoxEventStatus(pointingBox, eventType) {
    if (SHOULD_BE_RECORDED_EVENTS.includes(eventType)) {
        pointingBox.setAttribute('class', eventType)
    } else {
        pointingBox.removeAttribute('class')
    }
}

/**
 * Get or create pointingBox and update attribute from new eventInfo
 * @param {EventInfo} eventInfo 
 */
function renderPointingBox(eventInfo) {
    const position = eventInfo.target.position
    const pointingBox = getOrCreatePointingBox()
    setPointingBoxPosition(pointingBox, position)
    setPointingBoxEventStatus(pointingBox, eventInfo.type)
}

/**
 * Remove PointingBox from DOM
 */
function removePointingBox() {
    const pointingBox = document.getElementById('guiScraperPointingElement')
    if (pointingBox) {
        pointingBox.remove()
    }
}

// When scaper starts recording, this var will be set true
let RECORDING = false

setInterval(() => {
    const newMsgCtx = createCheckRecMsgCtx()
    sendToBackground(newMsgCtx).then(resMsgCtx => {
        RECORDING = resMsgCtx.context.recording
    }).catch(errorLogger)
}, 100)

/**
 * 
 * @param {boolean} enable 
 */
function setContextMenu(enable) {
    document.body.setAttribute('oncontextmenu', `return ${enable}`)
}

/**
 * This event handler will send information about event
 * to background.js on chrome extension
 * @param {Event} e 
 */
function record(e) {
    if (RECORDING) {
        const eventInfo = getEventInfo(e)
        sendEventToBackground(eventInfo)
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
        renderPointingBox(eventInfo)
        renderInfoBox(eventInfo)
        setContextMenu(false)
    } else {
        removePointingBox()
        setContextMenu(true)
    }
}

// Set event handlers
SHOULD_BE_RECORDED_EVENTS.forEach(e => document.addEventListener(e, record))
SHOULD_BE_POINTED_EVENTS.forEach(e => document.addEventListener(e, point))
