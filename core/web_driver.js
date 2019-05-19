const BROWSERS = 'chrome';
const {Builder} = require('selenium-webdriver');

const web_driver = options => {
    let {browser = 'chrome'} = options || {};
    if(!BROWSERS.includes(browser))
        throw `지원하지 않는 브라우저입니다. \n 지원하는 브라우저: ${BROWSERS}. 입력값: ${browser}`;

    return new Builder().forBrowser(browser).build();
};


module.exports = web_driver;