const jsdom = require("jsdom");
const { Document, SVGElement } = require('nodom');

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
global.loader = new Loader();
global.SVGElement = SVGElement;


if(process.env.dom==='jsdom') global.document = window.document;
else global.document = new Document();