			function updateSettings() {
				chrome.windows.getCurrent(function(win) {
					// get an array of the tabs in the window
					chrome.tabs.getAllInWindow(win.id, function(tabs) {
						for(i in tabs)// loop over the tabs
						{
							chrome.tabs.sendRequest(tabs[i].id, {
								action : 'updateSettings',
								keyboardshortcut : localStorage["keyboardshortcut"],
								oldkeyboardshortcut : localStorage["oldkeyboardshortcut"]
							});
						}
					});
				});
			}

			function openAllUrls(tab) {
				chrome.tabs.sendRequest(tab.id, {
					action : 'openRedditLinks',
					tabid : tab.id
				}, function(response) {
					openUrl(response.urls, 0, 0, response.tabid);
				});
			}

			function openUrl(urls, index, count, tabid) {

				if(index == urls.length) {
					if(count == 0) {
						chrome.tabs.sendRequest(tabid, {
							action : 'openNextPage'
						});
					}
					return;
				}

				var url = urls[index];

				if(!url[1].match("javascript:.*")) {

					var opencomments = (localStorage["opencomments"] == "true");
					var openvisitedlinks = (localStorage["openvisitedlinks"] == "true");
					var opennsfwlinks = (localStorage["opennsfwlinks"] == "true");
					var openlinksdirectly = (localStorage["openlinksdirectly"] == "true");
					var tabslimit = localStorage["tabslimit"];
					
					if(!opennsfwlinks && ((url[0].toLowerCase().indexOf("nsfw") != -1) || url[3])) {
						openUrl(urls, index + 1, count, tabid);
						return;
					}

					if(count >= tabslimit) {
						openUrl(urls, index + 1, count, tabid);
						return;
					}

					var historyItemUrl = url[1];
					chrome.history.getVisits({
						url : historyItemUrl
					}, function(visitItems) {

						if(!(openvisitedlinks || ((visitItems.length == 0) && url[4]))) {
							openUrl(urls, index + 1, count, tabid);
							return;
						}

						/*
						if(openlinksdirectly) {
							var isIReddIt = url[5] && (url[5].toLowerCase().indexOf("i.redd.it") != -1);
							var isIReddituploads = url[5] && (url[5].toLowerCase().indexOf("i.reddituploads.com") != -1);

							if(isIReddIt || isIReddituploads) {								
								url[1] = url[5];
								
								// add the original URL to the history
								chrome.history.addUrl({
									url : url[1]
								});
							}
						}
						*/

						chrome.tabs.sendRequest(tabid, {
							action : "scrapeInfoCompanionBar",
							index : index
						});

						chrome.tabs.create({
							url : url[1],
							selected : false
						});

						if(opencomments) {
							chrome.tabs.create({
								url : url[2],
								selected : false
							});
						}

						openUrl(urls, index + 1, count + 1, tabid);
					});
				}
			}

			function checkVersion() {

				function onInstall() {
					chrome.tabs.create({
						url : "options.html",
						selected : true
					});
				}

				function onUpdate() {
					chrome.tabs.create({
						url : "changelog.html",
						selected : true
					});
				}

				function getVersion() {
					var details = chrome.app.getDetails();
					return details.version;
				}

				// Check if the version has changed.
				var currVersion = getVersion();
				var prevVersion = localStorage['version']
				if(currVersion != prevVersion) {
					// Check if we just installed this extension.
					if( typeof prevVersion == 'undefined') {
						onInstall();
					} else {
						onUpdate();
					}
					localStorage['version'] = currVersion;
				}
			}

			function init() {

				var opencomments = localStorage["opencomments"];
				var openvisitedlinks = localStorage["openvisitedlinks"];
				var opennsfwlinks = localStorage["opennsfwlinks"];
				var openlinksdirectly = localStorage["openlinksdirectly"];
				var tabslimit = localStorage["tabslimit"];
				var keyboardshortcut = localStorage["keyboardshortcut"];

				localStorage["oldkeyboardshortcut"] = undefined;

				if(!opencomments) {
					localStorage["opencomments"] = "false";
				}

				if(!openvisitedlinks) {
					localStorage["openvisitedlinks"] = "false";
				}

				if(!opennsfwlinks) {
					localStorage["opennsfwlinks"] = "true";
				}

				if(!openlinksdirectly) {
					localStorage["openlinksdirectly"] = "false";
				}

				if(!tabslimit) {
					localStorage["tabslimit"] = 25;
				}

				if(!keyboardshortcut) {
					localStorage["keyboardshortcut"] = "Ctrl+Shift+F";
				}

				chrome.browserAction.onClicked.addListener(function(tab) {					
					openAllUrls(tab);
				});

				chrome.extension.onRequest.addListener(function(request, sender, callback) {
					switch (request.action) {
						case 'keyboardShortcut':
							openAllUrls(sender.tab);
							break;

						case 'initKeyboardShortcut':
							chrome.tabs.sendRequest(sender.tab.id, {
								action : 'updateSettings',
								keyboardshortcut : localStorage["keyboardshortcut"]
							});
							break;

						default:
							break;
					}
				});
				checkVersion();
			}
			
document.addEventListener('DOMContentLoaded', function () {
  init();
});
