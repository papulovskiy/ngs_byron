var titles = [];
var titlesCount = 0;

$.get(chrome.extension.getURL('titles.txt'), function(data) {
    titles = data.split("\n");
    titlesCount = titles.length;
    $(document).ready(function() {
	var pattern;
	var title = false;
	// страница новости
	if (document.location.href.match('/more/') && $("div.news_article_content > div > b").length > 0) {
	    pattern = "div.news_article_content > h1";
	    title = true;
	}

	// главная 
	if (jQuery.inArray(document.location.href, ['http://ngs.ru', 'http://www.ngs.ru/', 'http://ngs24.ru', 'http://www.ngs24.ru'])) {
	    pattern = "table.article h3 > a";
	    title = false;
	}
	replace(pattern, title);
    });
});


var saves = [];
function replace(pattern, title) {
	    $(pattern).each(function() {
		saves.push($(this).text());
		var text = titles[Math.floor(Math.random() * (titlesCount)) + 1];
		$(this).fadeOut(400, function() {
		    if (title) {
			setTimeout(function()  { if (document.title != text) { document.title = text; } }, 1000);
			$(document).attr('title', text);
		    }
		    $(this).text(text);
		    $(this).fadeIn();
		});
	    });
}