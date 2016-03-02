// ==UserScript==
// @name        Better Binger
// @namespace   com.brianmbauman.betterbinger
// @description A better way to catch up on your Comic-Rocket backlog.
// @include     https://www.comic-rocket.com/
// @include     https://www.comic-rocket.com/navbar/*
// @include     http://www.comic-rocket.com/*&binge
// @require     Comic.js
// @require     ComicList.js
// @require     Config.js
// @require     https://ajax.googleapis.com/ajax/libs/jquery/2.2.0/jquery.min.js
// @grant       GM_deleteValue
// @grant       GM_getValue
// @grant       GM_setValue
// @version     0.2.2
// ==/UserScript==

//Catch-all - TODO: should be refactored
function analyzeComics(config) {
    var comicsRawData = document.getElementsByClassName('comics-item');
    var comicsRawArray = [].slice.call(comicsRawData);
    var comicsData = new ComicList();

    console.log("Requested comics per day: " + config.comicsPerDay);
    console.log("Requested pages per day: " + config.pagesPerDay);

    //Build comicsData array
    comicsRawArray.forEach(function (comicRawData) {
        //Ignore broken comics
        if (comicRawData.getElementsByClassName('comics-item-edit').length > 0) return null;
        var comicData = Comic.fromRaw(comicRawData);

        //Only add comic data if it needs to be read.
        if (comicData.unread > 0) {
            comicsData.unread += comicData.unread;
            comicsData.comics.push(comicData);
        }
    });

    //Sort comics by # unread
    comicsData.comics.sort(function (a, b) {
        if (config.sort === Config.sortEnum.ASC) {
            return a.unread - b.unread;
        } else if (config.sort === Config.sortEnum.DESC) {
            return b.unread - a.unread;
        }
    });

    if (config.comicsPerDay === 0) {
        config.comicsPerDay = comicsData.comics.length;
    }

    //Filter to only user defined # of comics with most unread pages
    comicsData.comics = comicsData.comics.filter(function (comic, index) {
        return (index < config.comicsPerDay);
    });
    console.log("Comics to be analyzed:");
    console.log(comicsData);

    //Set total unread for filtered comics
    comicsData.comics.forEach(function (comic) {
        comicsData.filteredUnread += comic.unread;
    });

    //Calculate percentage of comicsPerDay for each comic, based on unread
    comicsData.comics.forEach(function (comic) {

        //Keep looking if we haven't met pagesPerDay request
        if (comicsData.selectedPages < config.pagesPerDay) {
            comic.unreadPercent = comic.unread / comicsData.filteredUnread;
            var requestedPagesPerDay = Math.round(comic.unreadPercent * config.pagesPerDay);
            var permittedPages = Math.min(requestedPagesPerDay, config.pagesPerDay - comicsData.selectedPages);

            /*
             Sets comic pages per day.
             If we still need pages, but can't round to 1 page per day, use 1 anyway.
             */
            comic.selectedPages = permittedPages > 0 ? permittedPages : 1;

            //Populate the page array
            for (var i = 0; i < comic.selectedPages; i++) {
                comic.pages.push({
                    index: comicsData.selectedPages + i,
                    read: false,
                    url: comic.baseURL + (comic.nextComic + i) + "?mark&binge"
                });
            }

            //Increments total actual pages per day
            comicsData.selectedPages += comic.selectedPages;
        }
    });

    //Filter to only comics we'll actually display
    comicsData.comics = comicsData.comics.filter(function (comic) {
        return (comic.selectedPages > 0);
    });

    return comicsData;
}

//TODO: Should be refactored to properly build elements instead of using string bullshit.
function buildLauncher(comicsData, config) {
    var comicList = document.getElementsByClassName('span8')[0];
    var launcher = document.createElement('div');
    launcher.className = "comics-item";
    launcher.innerHTML = "" +
    "<div class='comics-item-body'>" +
    "<a class='comics-item-image' href='" + comicsData.comics[0].pages[0].url + "'>" +
    "<span>Better Binger: " + comicsData.selectedPages + " pages</span>" +
    "</a>" +
    "<div class='comics-item-action'>" +
    "<a class='comics-item-read' href='" + comicsData.nextURL() + "'>Read</a>" +
    "</div>" +
    "</div>" +
    "<div class='comics-item-progressrow'>" +
    "<div class='comics-item-readers'>" +
    "<label style='color:white;float:left;'>Comics: <input id='comicsPerDay' size='20' type='number' value='" + config.comicsPerDay + "' style='width:40px;margin-right:5px;' disabled /></label>" +
    "<label style='color:white;float:left;'>Pages: <input id='pagesPerDay' size='20' type='number' value='" + config.pagesPerDay + "' style='width:40px;margin-right:5px;' disabled /></label>" +
    "<label style='color:white;float:left;'>Sort: <select id='sort' size='0' style='width:100px;margin-right:5px;' disabled >" +
    "<option value='ascending'>Ascending</option><option value='descending' selected>Descending</option>" +
    "</select></label>" +
    "<input id='reanalyze' value='Re-analyze' size='20' type='button' style='position:absolute;bottom:-2px;' />" +
    "</div>" +
    "</div>";

    comicList.insertBefore(launcher, comicList.getElementsByClassName('comics-item')[0]);
}

var location = window.location;
console.log('Launching Better Binger');
var config = Config.getConfig();
var comicList = ComicList.get(config);

if (location.href == 'https://www.comic-rocket.com/') {
    console.log('My Comics');
    buildLauncher(comicList, config);

    var reanalyze = document.getElementById('reanalyze');
    reanalyze.addEventListener("click", function () {
        GM_deleteValue('comicList');
        window.location.reload(true);
    }, false);

} else if (location.search.endsWith('&binge')) {
    console.log('Comic Page');
    //Mark current comic as read
    comicList.markPage(location);

} else if (location.href.contains('https://www.comic-rocket.com/navbar/') && document.referrer.endsWith('&binge')) {
    console.log('Navbar');

    var re = /navbar\/(.+)\/\?mark/;
    var currentPage = comicList.getPageByPartialURL(re.exec(window.document.URL)[1]);
    var prevPage = comicList.getPageByIndex(parseInt(currentPage.index) - 1);
    var nextPage = comicList.getPageByIndex(parseInt(currentPage.index) + 1);

    //Adjust UI
    var navbar = document.body.children[1];
    var leftButton = navbar.getElementsByClassName('arrow')[0];
    var rightButton = navbar.getElementsByClassName('arrow')[1];

    var scrubber = document.getElementById('scrubber');
    var firstNavPage = scrubber.getElementsByClassName('first')[0];
    var maxNavPages = scrubber.getElementsByClassName('last')[0];
    var currentNavPage = scrubber.getElementsByClassName('title')[0].childNodes[2];
    var bar = scrubber.getElementsByClassName('bar')[0];
    var handle = bar.getElementsByClassName('handle')[0];
    var overlay = scrubber.getElementsByClassName('overlay')[0];

    console.log('Updating UI');
    currentNavPage.textContent = "Page " + (parseInt(currentPage.index) + 1);
    firstNavPage.textContent = "1";
    maxNavPages.textContent = comicList.selectedPages;
    bar.style.width = 100 * parseInt(currentPage.index) / (parseInt(comicList.selectedPages) - 1) + "%";
    bar.innerHTML = null; //Removes handle navigation
    overlay.style.display = "none";

    console.log('Updating Linking');
    leftButton.href = prevPage ? prevPage.url : "https://www.comic-rocket.com";
    rightButton.href = nextPage ? nextPage.url : "https://www.comic-rocket.com";

    console.log('Navbar Updated');
} else {
    console.log('Nothing to do here.');
}





