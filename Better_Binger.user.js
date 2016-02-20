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
// @version     0.2.0
// ==/UserScript==

//Catch-all - TODO: should be refactored
function analyzeComics(config) {
    var filteredTotalUnread = 0;

    var comicsRawData = document.getElementsByClassName('comics-item');
    var comicsRawArray = [].slice.call(comicsRawData);
    var comicsData = new ComicList();

    console.log("Requested comics per day: " + config.comicsPerDay);
    console.log("Requested pages per day: " + config.pagesPerDay);

    //Build comicsData array
    comicsRawArray.forEach(function (comicRawData) {
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
             Sets comic pages per day and increments total actual pages per day.
             If we still need pages, but can't round to 1 page per day, use 1 anyway.
             */
            comicsData.selectedPages += comic.selectedPages = permittedPages > 0 ? permittedPages : 1;

            //Populate the page array
            for (var i = 0; i < comic.selectedPages; i++) {
                comic.pages.push({
                    read: false,
                    url: comic.baseURL + (comic.nextComic + i) + "?mark&binge"
                });
            }

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
    var node = document.createElement('script');
    node.setAttribute("type", "text/javascript");
    var textNode = document.createTextNode("function submit(){window.location.reload(true);}");
    node.appendChild(textNode);
    document.getElementsByTagName('head')[0].appendChild(node);

    var comicList = document.getElementsByClassName('span8')[0];
    var launcher = document.createElement('div');
    launcher.className = "comics-item";
    launcher.innerHTML = "" +
    "<div class='comics-item-body'>" +
    "<a class='comics-item-image' href='" + comicsData.comics[0].pages[0].url + "'>" +
    "<span>Your daily " + comicsData.selectedPages + "-page binge!</span>" +
    "</a>" +
    "<div class='comics-item-action'>" +
    "<a class='comics-item-read' href='" + comicsData.nextURL() + "'>Read</a>" +
    "</div>" +
    "</div>" +
    "<div class='comics-item-progressrow'>" +
    "<div class='comics-item-readers'>" +
    "<label style='color:white;float:left;'>Comics: <input id='comicsPerDay' size='20' type='number' value='" + config.comicsPerDay + "' style='width:50px;margin-right:5px;' /></label>" +
    "<label style='color:white;float:left;'>Pages: <input id='pagesPerDay' size='20' type='number' value='" + config.pagesPerDay + "' style='width:50px;margin-right:5px;' /></label>" +
    "<label style='color:white;float:left;'>Sort: <select id='sort' size='0' type='number' value='" + config.sort + "' style='width:75px;margin-right:5px;'>" +
    "<option value='ascending'>Ascending</option><option value='descending'>Descending</option>" +
    "</select></label>" +
    "<input id='reanalyze' value='Re-analyze' size='20' type='button' style='position:absolute;bottom:-2px;' onclick='submit()' />" +
    "</div>" +
    "</div>";

    comicList.insertBefore(launcher, comicList.getElementsByClassName('comics-item')[0]);
}

function submit() {
    alert('Clicked!');
}

//GM_deleteValue('comicList');
$("body").append(" more text.");
console.log('Launching Better Binger');
var config = Config.getConfig();
//ComicList.clear();
var comicList = ComicList.get(config);
var location = window.location;
if (location.href == 'https://www.comic-rocket.com/') {
    buildLauncher(comicList, config);

    //Get Config

    //Get ComicList

    //Build Launcher
} else if (location.search.endsWith('&binge')) {
    //Mark current comic as read
    comicList.markPage(location);

    //Adjust UI

    console.log('Adjusting UI');
    var iframe = document.getElementById('readernav');
    console.log(iframe);
    var navFrame = iframe.document;
    console.log(navFrame);
    var navbar = navFrame.getElementById('navbar');
    console.log(navbar);
    navFrame.getElementsByClassName('arrow')[1].href = comicList.nextURL();

} else {
    console.log('Nothing to do here.');
}





