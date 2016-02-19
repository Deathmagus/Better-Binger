/**
 * Created by Brian Bauman on 2016-02-03.
 */

/* Object to represent complete list of comics with unread pages
 */
function ComicList() {
    this.comics = [];
    this.date = new Date();
    this.filteredUnread = 0;
    this.selectedPages = 0;
    this.unread = 0;
}

ComicList.clear = function () {
    console.log('Clearing comicList');
    GM_deleteValue('comicList');
}

ComicList.fromJSON = function (json) {
    json = JSON.parse(json);
    var comicsList = new ComicList();

    comicsList.comics = json.comics;
    comicsList.date = new Date(json.date);
    comicsList.filteredUnread = json.filteredUnread;
    comicsList.selectedPages = json.selectedPages;
    comicsList.unread = json.unread;
    return comicsList;
}

ComicList.get = function (config) {
    var comicList;
    if (comicList = ComicList.load()) {
    } else {
        comicList = analyzeComics(config);
        comicList.save();
    }
    console.log('ComicList:');
    console.log(comicList);
    return comicList;
}

ComicList.load = function () {
    var comicList = GM_getValue('comicList');
    var today = new Date();

    if (comicList) {
        comicList = ComicList.fromJSON(comicList);
        console.log('ComicList found');

        //Only load if date is current
        if (comicList.date.toDateString() == today.toDateString()) {
            console.log('ComicList is up-to-date');
            return comicList;
        } else {
            console.log('ComicList is out-of-date');
        }
    }
    return null;
}

ComicList.prototype.markPage = function (page) {
    this.comics.forEach(function (comic) {
        if (page.contains(comic.baseURL)) {
            comic.markPage(page);
        }
    });
}

ComicList.prototype.nextURL = function () {
    for (var i = 0; i < this.comics.length; i++) {
        var comic = this.comics[i];
        for (var j = 0; j < comic.pages.length; j++) {
            var page = comic.pages[j];
            if (!page.read) {
                return page.url;
            }
        }
    }
}

ComicList.prototype.toJSON = function () {
    return JSON.stringify({
        "comics": this.comics,
        "date": this.date.toJSON(),
        "filteredUnread": this.filteredUnread,
        "selectedPages": this.selectedPages,
        "unread": this.unread
    });
}

ComicList.prototype.save = function () {
    GM_setValue('comicList', this.toJSON());
    console.log('ComicList successfully saved.');
}