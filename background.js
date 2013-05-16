var currTabId;

var enabled = true;
if (localStorage.enabled === false) {
    enabled = false;
}

function checkForValidUrl(tabId, changeInfo, tab) {
    currTabId = tabId;
    chrome.pageAction.show(tabId);
}

chrome.tabs.onUpdated.addListener(checkForValidUrl);

chrome.pageAction.onClicked.addListener(function(tab) {
    enabled = !enabled;
    localStorage.enabled = enabled;
    chrome.pageAction.setIcon({tabId: tab.id, path: 'byron-extension-19' + (enabled ? '' : '-disabled') + '.png'});
    chrome.tabs.sendRequest(tab.id, { enabled: enabled }, function handler(response) {
    });
});
