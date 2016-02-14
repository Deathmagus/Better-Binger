/**
 * Created by Brian Bauman on 2016-02-05.
 */

/* Object to represent individual comics
 * comicRawData = A complete "comics-item" nodeSet
 */
function Comic(comicRawData) {
    var progressLabel = comicRawData.getElementsByClassName('progress-label')[0].textContent.split('/');
    var title = comicRawData.getElementsByClassName('comics-item-image')[0].firstChild.textContent;
    var url = comicRawData.getElementsByClassName('comics-item-read')[0].getAttribute('href');

    this.baseURL = url.substring(0, url.lastIndexOf('/') + 1);
    this.nextComic = parseInt(progressLabel[0]) + 1;
    this.pages = [];
    this.title = title;
    this.unread = progressLabel[1] - progressLabel[0];
}

Comic.prototype.markPage = function (page) {

}