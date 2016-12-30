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
        console.log(savedConfig);
        config.comicsPerDay = savedConfig.comicsPerDay;
        config.pagesPerDay = savedConfig.pagesPerDay;
        config.sort = savedConfig.sort;
        console.log('Config loaded:');
    } else {
        console.log('No config - using defaults');
    }
    console.log(config);
    return config;
};

Config.prototype.save = function(comicsPerDay, pagesPerDay, sort){
    this.comicsPerDay = comicsPerDay;
    this.pagesPerDay = pagesPerDay;
    switch(sort){
        case "ascending":
            this.sort = Config.sortEnum.ASC;
            break;
        case "descending":
            this.sort = Config.sortEnum.DESC;
            break;
        default:
            throw "Invalid sorting method configured";
    }

    GM_setValue('config', this.toJSON());
    console.log('Configuration successfully saved.');

}

Config.prototype.toJSON = function(){
    return JSON.stringify({
        "comicsPerDay": this.comicsPerDay,
        "pagesPerDay": this.pagesPerDay,
        "sort": this.sort
    });
}

Config.sortEnum = {
    ASC: "ascending",
    DESC: "descending"
};