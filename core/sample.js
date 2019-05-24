const json_parser = require('./json_parser');
const google_body = {
    entry_point:'https://www.google.com/search?q=google&oq=google&aqs=chrome..69i57j0j69i60l3j69i65.1583j0j7&sourceid=chrome&ie=UTF-8',
    process:[
        {
            type:'read',
            css_selector:'#rso > div > div > div:nth-child(1) > div > div > div.r > a > h3',
            inner_attribute: 'text'
        },
        {
            type:'parent_list',
            css_selector:'#rso > div > div',
            childs: [
                {
                    css_selector:'#rso > div > div > div > div > div > div.r > a > h3',
                    inner_attribute: 'text'
                },
                {
                    css_selector:'#rso > div > div > div > div > div > div.s > div > span',
                    inner_attribute: 'text'
                }
            ]
        }
    ]
};
const naver_body = {
    entry_point:'https://search.naver.com/search.naver?query=%ED%83%80%EB%8B%A4&where=post&sm=tab_nmr&nso=',
    process:[
        {
            type:'read',
            css_selector:'#nx_related_keywords > dl > dd.lst_relate._related_keyword_list > ul',
            inner_attribute: 'text'
        },
        {
            type:'parent_list',
            css_selector:'#elThumbnailResultArea',
            childs: [
                {
                    css_selector:'#sp_blog_1 > dl > dt > a',
                    inner_attribute: 'text'
                },
                {
                    css_selector:'#sp_blog_1 > dl > dd.sh_blog_passage',
                    inner_attribute: 'text'
                }
            ]
        }
    ]
};

const rocketpunch_body = {
    entry_point:'https://www.rocketpunch.com/jobs?keywords=%EC%82%B0%EC%97%85%EA%B8%B0%EB%8A%A5%EC%9A%94%EC%9B%90',
    process:[
        {
            type:'read',
            css_selector:'#company-list > div.header > h2 > span.filter-summary',
            inner_attribute: 'text'
        },
        {
            type:'parent_list',
            css_selector:'#company-list',
            childs: [
                {
                    css_selector:'#company-list > div > div.content > div.company-name > a:nth-child(1) > h4 > strong',
                    inner_attribute: 'text'
                },
                {
                    css_selector:'#company-list > div > div.content > div.description',
                    inner_attribute: 'text'
                }
            ]
        }
    ]
};

const body = wanted_body;
const parser = new json_parser(body);
parser.run()
    .then( output_list => console.log(output_list))
    .catch(error => console.error(error));