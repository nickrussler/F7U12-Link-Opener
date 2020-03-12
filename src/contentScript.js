var jquery_set_links;
var jquery_set_comments;

function fakeClick(obj) {
	$(obj).closest('.thing').addClass('visited');
	
	var evObj = document.createEvent('MouseEvents');
	evObj.initMouseEvent("mousedown", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 1, null);
	
	obj.dispatchEvent(evObj);
}

function isNSFW(url) {	
	/*
	var nsfw_arr = $("#siteTable .even .nsfw-stamp, #siteTable .odd .nsfw-stamp");
	
	for (var i=0; i < nsfw_arr.length; i++) {
	  if (url.parentNode.parentNode == nsfw_arr[i].parentNode.parentNode){
	  	return true;
	  }	  
	};
	*/
	
	return false;
}

chrome.extension.onRequest.addListener(function(request, sender, callback) {	
	switch (request.action) {
		case 'openRedditLinks':		
			var isNewRedditLayout = $("#siteTable").length === 0;
			
			if (isNewRedditLayout) {				
				jquery_set_links = $('.scrollerItem a[data-click-id="body"]:visible');
				jquery_set_comments = $('.scrollerItem a[data-click-id="comments"]:visible');
			} else {
				jquery_set_links = $("#siteTable a.title:visible");
				jquery_set_comments = $("#siteTable a.comments:visible");
			}

			var data = Array();

			var i;
			for( i = 0; i < jquery_set_links.length; i++) {
				var isLinkNSFW = isNSFW(jquery_set_links[i]);
				var linkWasNotMarkedVisited = ($(jquery_set_links[i]).parents('.visited').length == 0);
				
				data.push(new Array(jquery_set_links[i].text, jquery_set_links[i].href, jquery_set_comments[i].href, isLinkNSFW, linkWasNotMarkedVisited));
			}

			if(data.length > 0) {
				callback({
					urls : data,
					tabid : request.tabid
				});
			}
			break;

		case 'openNextPage':
			var isNewRedditLayout = $("#siteTable").length === 0;
			
			if (isNewRedditLayout) {
				window.scrollTo(0, document.body.scrollHeight);
			} else {
				window.location = $('.nextprev a[rel~="next"]').attr("href");
			}		
			
			break;

		case 'scrapeInfoCompanionBar':
			fakeClick(jquery_set_links[request.index]);
			break;

		case 'updateSettings':
			if(request.keyboardshortcut != request.oldkeyboardshortcut) {
				if(request.oldkeyboardshortcut) {
					shortcut.remove(request.oldkeyboardshortcut);
				}

				shortcut.add(request.keyboardshortcut, function() {
					chrome.extension.sendRequest({
						action : "keyboardShortcut"
					});
				});
			}
			break;

		default:
			break;
	}
});

chrome.extension.sendRequest({
	action : "initKeyboardShortcut"
});
