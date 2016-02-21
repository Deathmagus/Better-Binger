/**
 * Created by Brian Bauman on 2016-02-05.
 */

/* Object to represent individual comics
 * comicRawData = A complete "comics-item" nodeSet
 */
function Comic(comicRawData) {
}

Comic.fromJSON = function (json) {
    var comic = new Comic();

    comic.baseURL = json.baseURL;
    comic.nextComic = json.nextComic;
    comic.pages = json.pages;
    comic.title = json.title;
    comic.totalPages = json.totalPages;
    comic.unread = json.unread;

    return comic;
};

Comic.fromRaw = function (rawData) {
    var comic = new Comic();

    var progressLabel = rawData.getElementsByClassName('progress-label')[0].textContent.split('/');
    var title = rawData.getElementsByClassName('comics-item-image')[0].firstChild.textContent;
    var url = rawData.getElementsByClassName('comics-item-read')[0].getAttribute('href');

    comic.baseURL = url.substring(0, url.lastIndexOf('/') + 1);
    comic.nextComic = parseInt(progressLabel[0]) + 1;
    comic.pages = [];
    comic.title = title;
    comic.totalPages = progressLabel[1];
    comic.unread = progressLabel[1] - progressLabel[0];

    return comic;
};