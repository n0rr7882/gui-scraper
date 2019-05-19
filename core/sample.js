const SCRAPER = require('./scraper');
const url = 'https://www.google.com/search?q=javascript+strip&oq=javascript+strip&aqs=chrome..69i57j0l5.2210j0j7&sourceid=chrome&ie=UTF-8';
const scraper = new SCRAPER(url);

(async function (){
    // 전체 리스트 불러오기
    let ul = await scraper.find_one_element('#res');
    // 불러올 item 의 css selector 중 마지막 N 개 불러오기
    let li_parent_css_selector = await SCRAPER.get_tail_css_selector('#rso > div > div > div:nth-child(1) > div > div > div.r > a:nth-child(1) > h3', 4);

    let list_items = await scraper.find_many_elements(li_parent_css_selector, ul);

    console.log(li_parent_css_selector);
    for (let i=0; i<list_items.length; i++){
        try{
            let text = await list_items[i].getText();
            console.log(text + '\n');
        }catch(e){
            continue;
        }
    }
    scraper.quit();
})();
