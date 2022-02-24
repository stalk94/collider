const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM(`<head></head><body></body>`, {
    url: "http://last-exit.ru/",
    referrer: "http://last-exit.ru/",
    contentType: "text/html",
    includeNodeLocations: true,
    storageQuota: 10000000,
    runScripts: "outside-only",
    pretendToBeVisual: true
});
class Loader extends jsdom.ResourceLoader {
    fetch(url, options) {
        return super.fetch(url, options);
    }
}
global.window = window;
global.document = window.document;
global.loader = new Loader();

