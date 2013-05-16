var titles = [];
var titlesCount = 0;

chrome.runtime.onConnect.addListener(function(port) {
    port.onMessage.addListener(function(msg) {
	port.postMessage({counter: msg.counter+1});
    });
});

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    getPatternAndReplace(request.enabled);
    sendResponse({enabled: request.enabled});
});

$.get(chrome.extension.getURL('titles.txt'), function(data) {
    titles = data.split("\n");
    titlesCount = titles.length;
    $(document).ready(function() {
	getPatternAndReplace();
    });
});


function getPatternAndReplace(enabled) {
	enabled = typeof enabled !== 'undefined' ? enabled : true;
	
	var pattern;
	var title = false;

	// страница новости
	if (document.location.href.match('/more/') && $("div.news_article_content > div > b").length > 0) {
	    pattern = "div.news_article_content > h1";
	    title = true;
	}

	// главная 
	if (!pattern && jQuery.inArray(document.location.href, ['http://ngs.ru/', 'http://www.ngs.ru/', 'http://ngs24.ru/', 'http://www.ngs24.ru/']) > -1) {
	    pattern = "table.article h3 > a:not([class])";
	}

	// главная новостей
	if (!pattern && jQuery.inArray(document.location.href, ['http://news.ngs.ru/', 'http://www.news.ngs.ru/', 'http://news.ngs24.ru/', 'http://www.news.ngs24.ru/']) > -1) {
	    pattern = ["div.day_block > a > h2", "div.other_articles > a > h2"];
	}
	
	// список статей
	if (!pattern && document.location.href.match('/articles')) {
	    pattern = "td.home_article > h2 > a";
	}
	
	// главные подпроектов
	if (!pattern && document.location.href.match('.ngs.ru/$') && jQuery.inArray(document.location.href, ['http://news.ngs.ru/', 'http://www.ngs.ru/']) < 0) {
	    pattern = "div.article > h1 > a";
	}
	
	// статьи в подпроектах
	if (!pattern && document.location.href.match('/more/')) {
	    pattern = "div.article > h1";
	    title = true;
	}
	
	if( typeof pattern === 'string' ) {
	    replace(pattern, title, enabled);
	} else {
	    for (var i in pattern) {
		replace(pattern[i], title, enabled);
	    }
	}
}

var defaultText = "---no---";
var saves = [];
var used = [defaultText];

// Replace matched elements and save source texts
function replace(pattern, title, enabled) {
	$(pattern).each(function() {
	    if (enabled) {
		saves.push($(this).text());
		var text = defaultText;
		while (!jQuery.inArray(text, used)) {
		    text = titles[Math.floor(Math.random() * (titlesCount)) + 1];
		}
	    } else {
		text = saves.shift();
	    }
	    $(this).fadeOut(400, function() {
		if (title) {
		    setTimeout(function()  { if (document.title != text) { document.title = text; } }, 1000);
		    $(document).attr('title', text);
		}
		$(this).text(text);
		$(this).fadeIn();
	    });
	    if (!enabled) {
		used = [defaultText];
	    }
	});
}


// Google Analytics
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');
ga('create', 'UA-40944043-1', 'ngs-byron-extension.com');
ga('send', 'pageview');
