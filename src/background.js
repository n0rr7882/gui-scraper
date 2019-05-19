/*global chrome*/

chrome.extension.onMessage.addListener(function(myMessage, sender, sendResponse){
    //do something that only the extension has privileges here
    console.log(myMessage)
    console.log(sender)
    console.log(sendResponse)
    return true;
 });