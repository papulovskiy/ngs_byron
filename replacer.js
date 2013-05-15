var titles = [];
var titlesCount = 0;

$.get(chrome.extension.getURL('titles.txt'), function(data) {
    titles = data.split("\n");
    titlesCount = titles.length;
    $(document).ready(function() {
	replace();
    });
});


var saves = [];
function replace() {
    if (document.location.href.match('/more/')) {
	if ($("div.news_article_content > div > b").length > 0) {
	    $("div.news_article_content > h1").each(function() {
		saves.push($(this).text());
		var text = titles[Math.floor(Math.random() * (titlesCount)) + 1];
		$(this).fadeOut(400, function() {
//		    document.title = text;
		    setTimeout(function()  { if (document.title != text) { document.title = text; } }, 1000);
		    $(document).attr('title', text);
		    $(this).text(text);
		    $(this).fadeIn();
		});
	    });
	}
    }
}