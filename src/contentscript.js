/*global chrome*/

import './contentscript.css'

function getCssPath(element) {
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

function getEventInfo(e) {

    var targetSelector = getCssPath(e.target)
    var targetTag = e.target.tagName.toLowerCase()
    var targetInnerText = e.target.innerText
    var targetInnerHTML = e.target.innerHTML
    var targetAttributes = e.target.attributes
    var targetPosition = e.target.getBoundingClientRect()

    var attributesFormatted = {}

    for (var key in Object.keys(targetAttributes)) {
        var attr = targetAttributes[key]
        attributesFormatted[attr.name] = attr.value
    }

    return {
        type: e.type,
        target: {
            selector: targetSelector,
            tag: targetTag,
            innerText: targetInnerText,
            innerHTML: targetInnerHTML,
            attributes: attributesFormatted,
            position: targetPosition
        }
    }
}

function sendEventToBackground(eventInfo) {
    //send message to ext
    chrome.extension.sendMessage(eventInfo, function (response) {
        //callback
        console.log('response from background.js')
    })
}

function createInfoBox() {
    var infoBox = document.createElement('div')
    var infoBoxId = document.createAttribute('id')
    infoBoxId.value = 'guiScraperInfoBoxElement'
    infoBox.setAttributeNode(infoBoxId)
    return infoBox
}

function createPointingBox() {
    var pointingBox = document.createElement('div')
    var pointingBoxId = document.createAttribute('id')
    pointingBoxId.value = 'guiScraperPointingElement'
    pointingBox.setAttributeNode(pointingBoxId)
    return pointingBox
}

function attachPointingBox(pointingBox) {
    document.body.appendChild(pointingBox)
}

function getOrCreatePointingBox() {
    var pointingBox = document.getElementById('guiScraperPointingElement')
    if (!pointingBox) {
        pointingBox = createPointingBox()
        attachPointingBox(pointingBox)
    }
    return pointingBox
}

function setPointingBoxPosition(pointingBox, position) {
    console.log(position)
    pointingBox.style.top = position.top + 'px'
    pointingBox.style.left = position.left + 'px'
    pointingBox.style.width = position.width + 'px'
    pointingBox.style.height = position.height + 'px'
}

function renderPointingBox(info) {
    var position = info.target.position
    var pointingBox = getOrCreatePointingBox()
    setPointingBoxPosition(pointingBox, position)
}

function record(e) {
    var info = getEventInfo(e)
    sendEventToBackground(info)
}

function point(e) {
    var info = getEventInfo(e)
    renderPointingBox(info)
}

var shouldBeRecordedEvents = ['click', 'keypress']
var shouldBePointedEvents = ['mousemove']

shouldBeRecordedEvents.forEach(e => document.addEventListener(e, record))
shouldBePointedEvents.forEach(e => document.addEventListener(e, point))
