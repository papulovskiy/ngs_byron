var currTabId;
var presences = {};

var enabled = true;
if (localStorage.enabled === false) {
    enabled = false;
}

function checkForValidUrl(tabId, changeInfo, tab) {
    currTabId = tabId;
    if (presence[tabId]) {
	chrome.pageAction.show(tabId);
    }
}

chrome.tabs.onUpdated.addListener(checkForValidUrl);

chrome.pageAction.onClicked.addListener(function(tab) {
    enabled = !enabled;
    localStorage.enabled = enabled;
    chrome.pageAction.setIcon({tabId: tab.id, path: 'images/byron-extension-19' + (enabled ? '' : '-disabled') + '.png'});
    chrome.tabs.sendRequest(tab.id, { enabled: enabled }, function handler(response) {
    });
});


chrome.runtime.onConnect.addListener(function(port) {
    port.onMessage.addListener(function(msg) {
	port.postMessage({});
    });
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.command == 'enable') {
	    chrome.pageAction.show(currTabId);
	    presences[currTabId] = true;
	} else if (request.command == 'disable') {
	    chrome.pageAction.hide(currTabId);
	    presence[currTabId] = false;
	}
        sendResponse({});
});