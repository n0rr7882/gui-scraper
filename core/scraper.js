require('chromedriver');
const web_driver = require('./web_driver.js');
const WEB_DRIVER = Symbol();
const URL = Symbol();
const {By, until} = require('selenium-webdriver');

const scraper = class {
    constructor(url, options){
        if(scraper.checkUrlForm(url) === false){
            throw "Invalid Url form"
        }
        this[WEB_DRIVER] = web_driver(options);
        this[URL] = url;
        this[WEB_DRIVER].get(this[URL]);
    }
    static checkUrlForm(url){
        const expUrl = /^http[s]?\:\/\//i;
        return expUrl.test(url);
    };
    static get_tail_css_selector(css_selector, selector_count = 2){
        let css_selector_list = css_selector.split('>');
        if (css_selector_list.length > selector_count){
            let return_string = "";
            for(let i = selector_count; i>=1; i--){
                if(i === selector_count){
                    return_string += `${css_selector_list[css_selector_list.length-i]}`;
                }else{
                    return_string += `>${css_selector_list[css_selector_list.length-i]}`;
                }
            }
            return return_string;
        }
    }
    static longest_same_prefix(array){
        let A= array.concat().sort();
        let a1= A[0], a2= A[A.length-1], L= a1.length, i= 0;
        while(i<L && a1.charAt(i) === a2.charAt(i)) i++;
        let lsp_substring = a1.substring(0, i);
        let splited_lsp = lsp_substring.split('>');
        let return_string = "";
        try{
            document.querySelector(lsp_substring);
            return_string = lsp_substring;
        }catch{
            for(let i=0; i<splited_lsp.length - 1; i++){
                if (i === 0){
                    return_string += splited_lsp[i];
                }else{
                    return_string += ' > ' + splited_lsp[i];
                }
            }
        }
        return return_string;

    }
    async find_one_element(css_selector, base = this[WEB_DRIVER]){
        let wait_element = await this.waitCss(10000, css_selector);
        if(wait_element){
            return base.findElement(By.css(css_selector))
        }
        return null
    }
    async find_one_element_and_get_text(css_selector){
        let element = await this.find_one_element(css_selector);
        return await element.getText()
    }
    async find_many_elements(css_selector, base = this[WEB_DRIVER]){
        let wait_element = await this.waitCss(10000, css_selector);
        if(wait_element){
            return base.findElements(By.css(css_selector));
        }
        return null
    }
    async waitCss(time, css, base = this[WEB_DRIVER]){
        return base.wait(until.elementLocated(By.css(css)), time);
    }
    get action(){
        return this[WEB_DRIVER].actions();
    }
    get url(){
        return this[URL];
    }
    quit(){
        this[WEB_DRIVER].quit();
    }
};

module.exports = scraper;