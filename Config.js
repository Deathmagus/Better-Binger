/**
 * Created by Brian Bauman on 2016-02-07.
 */

/* Object to store and retrieve config settings
 */
function Config() {
    this.comicsPerDay = 5;
    this.pagesPerDay = 20;
    this.sort = Config.sortEnum.DESC;
}

Config.getConfig = function () {
    var config = new Config();
    var savedConfig;

    //If saved config data exist, load it.
    if (savedConfig = GM_getValue('config')) {
        config.comicsPerDay = savedConfig.comicsPerDay;
        config.pagesPerDay = savedConfig.pagesPerDay;
        config.sort = savedConfig.sort;
        console.log('Config loaded');
    } else {
        console.log('No config - using defaults');
    }
    return config;
}

Config.sortEnum = {
    ASC: "ascending",
    DESC: "descending"
}