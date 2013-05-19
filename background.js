var currTabId;
var presences = {};

var enabled = localStorage.enabled;
var found = false;

function checkForValidUrl(tabId, changeInfo, tab) {
    currTabId = tabId;
    if (presences[tabId]) {
	chrome.pageAction.show(tabId);
    }
}

chrome.tabs.onUpdated.addListener(checkForValidUrl);

chrome.pageAction.onClicked.addListener(function(tab) {
    enabled = !enabled;
    localStorage.enabled = enabled;
    makeDecision(tab.id);
});


chrome.runtime.onConnect.addListener(function(port) {
    port.onMessage.addListener(function(msg) {
	port.postMessage({});
    });
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	var tabId = sender.tab.id;
	
	if (request.count > 0) {
	    chrome.pageAction.show(tabId);
	    presences[tabId] = true;
	    found = true;
	} else if (request.count == 0) {
	    chrome.pageAction.hide(tabId);
	    presences[tabId] = false;
	    found = false;
	}
	
        makeDecision(tabId);
        sendResponse({enabled: enabled});
});

function makeDecision(tabId) {
    if (enabled) {
	send(tabId, 'forward');
    } else {
	send(tabId, 'reward');
    }
    updateIcon(tabId);
}

function send(tabId, command) {
    chrome.tabs.sendRequest(tabId, {command: command}, function handler(response) {});
}

function updateIcon(tabId) {
    chrome.pageAction.setIcon({tabId: tabId, path: 'images/byron-extension-19' + (enabled ? '' : '-disabled') + '.png'});
}