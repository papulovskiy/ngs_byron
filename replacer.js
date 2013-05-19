var enabled = false;

var way;

var titles = [];
var titlesCount = 0;

chrome.runtime.onConnect.addListener(function(port) {
    port.onMessage.addListener(function(msg) {
	port.postMessage({});
    });
});

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    enabled = request.enabled;
    if( typeof way.pattern === 'string' ) {
	if (request.command == 'forward') {
	    forward(way.pattern, way.title);
	} else if (request.command == 'reward') {
	    reward(way.pattern, way.title);
	}
    } else {
	var sum = 0;
	for (var i in way.pattern) {
	    if (request.command == 'forward') {
		forward(way.pattern[i], way.title);
	    } else if (request.command == 'reward') {
		reward(way.pattern[i], way.title);
	    }
	}
    }

    sendResponse({enabled: request.enabled});
});

$.get(chrome.extension.getURL('titles.txt'), function(data) {
    titles = data.split("\n");
    titlesCount = titles.length;
    $(document).ready(function() {
	way = getPattern();
	var count = getCount(way);
	chrome.extension.sendMessage({count: count}, function(response) {});
    });
});


function getPattern() {
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
	    pattern = ["div.article > h1 > a", "div.tit > a", "div.post_block > h2 > a", "div.news_section > h1 > a", "div.newslistom_inner > a > strong"];
	}
	
	// статьи в подпроектах
	if (!pattern && href.match('/more/')) {
	    pattern = ["div.article > h1", "div.article_announc > h1"];
	    title = true;
	}
	if (!pattern && href.match('/article/')) {
	    pattern = "div.header > h1:not([class])";
	    title = true;
	}
	
	return {pattern: pattern, title: title};
	if (!pattern) {
	    return;
	}
	
	if( typeof pattern === 'string' ) {
	    replace(pattern, title, forward);
	} else {
	    for (var i in pattern) {
		replace(pattern[i], title, forward);
	    }
	}
}

function getCount(way) {
    if( typeof way.pattern === 'string' ) {
	return $(way.pattern).length;
    } else {
	var sum = 0;
	for (var i in way.pattern) {
	    sum += $(way.pattern[i]).length;
	}
	return sum;
    }
}

var defaultText = "---no---";
var saves = [];
var used = [defaultText];

function forward(pattern, title) {
    $(pattern).each(function() {
	saves.push($(this).text());
	var text = defaultText;
	while (jQuery.inArray(text, used) > -1) {
	    text = titles[Math.floor(Math.random() * (titlesCount)) + 1];
	}
	$(this).fadeOut(400, function() {
	    if (title) {
		setTimeout(function()  { if (document.title != text) { document.title = text; } }, 1000);
		$(document).attr('title', text);
	    }
	    $(this).text(text);
	    $(this).fadeIn(400);
	});
    });
}

function reward(pattern, title) {
    $(pattern).each(function() {
	text = saves.shift();
	if (!text) return;
	$(this).fadeOut(0, function() {
	    if (title) {
		setTimeout(function()  { if (document.title != text) { document.title = text; } }, 1000);
		$(document).attr('title', text);
	    }
	    $(this).text(text);
	    $(this).fadeIn(0);
	});
    });
}
