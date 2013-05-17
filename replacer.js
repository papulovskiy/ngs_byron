var titles = [];
var titlesCount = 0;

chrome.runtime.onConnect.addListener(function(port) {
    port.onMessage.addListener(function(msg) {
	port.postMessage({});
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
	var href = document.location.href;
	
	if (!href.match('ngs.ru/')) {
	    return;
	}

	// страница новости
	if (href.match('/more/') && $("div.news_article_content > div > b").length > 0) {
	    pattern = "div.news_article_content > h1";
	    title = true;
	}

	// главная 
	if (!pattern && jQuery.inArray(href, ['http://ngs.ru/', 'http://www.ngs.ru/', 'http://ngs24.ru/', 'http://www.ngs24.ru/']) > -1) {
	    pattern = "table.article h3 > a:not([class])";
	}

	// главная новостей
	if (!pattern && jQuery.inArray(href, ['http://news.ngs.ru/', 'http://www.news.ngs.ru/', 'http://news.ngs24.ru/', 'http://www.news.ngs24.ru/']) > -1) {
	    pattern = ["div.day_block > a > h2", "div.other_articles > a > h2"];
	}
	
	// список статей
	if (!pattern && (href.match('/articles') || href.match('/(.*)/index.php$'))) {
	    pattern = "td.home_article > h2 > a";
	}
	
	// главные подпроектов
	if (!pattern && href.match('.ngs.ru/$') && jQuery.inArray(href, ['http://news.ngs.ru/', 'http://www.ngs.ru/']) < 0) {
	    pattern = "div.article > h1 > a";
	}
	
	// статьи в подпроектах
	if (!pattern && href.match('/more/')) {
	    pattern = "div.article > h1";
	    title = true;
	}
	if (!pattern && href.match('/article/')) {
	    pattern = "div.header > h1:not([class])";
	    title = true;
	}
	
	console.log(pattern);
	if (!pattern) {
	    return;
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

function replace(pattern, title, enabled) {
    var found = false;
	$(pattern).each(function() {
//	    console.log(this);
	    found = true;
	    if (enabled) {
		saves.push($(this).text());
		var text = defaultText;
		while (jQuery.inArray(text, used) > -1) {
		    text = titles[Math.floor(Math.random() * (titlesCount)) + 1];
		}
	    } else {
		text = saves.shift();
	    }
	    $(this).fadeOut(enabled ? 400 : 0, function() {
		if (title) {
		    setTimeout(function()  { if (document.title != text) { document.title = text; } }, 1000);
		    $(document).attr('title', text);
		}
		$(this).text(text);
		$(this).fadeIn(enabled ? 400 : 0);
	    });
	    if (!enabled) {
		used = [defaultText];
	    }
	});
    if (found) {
	informBackground('enable');
    } else {
	informBackground('disable');
    }
}

function informBackground(command) {
    chrome.extension.sendMessage({command: command}, function(response) {});
}
