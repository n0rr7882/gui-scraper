const guiScraper = require('./scraper');

const json_parser = class {
    constructor(json_object, options) {
        this.entry_point = json_object.entry_point;
        this.process_list = json_object.process;
        this.scraper = new guiScraper(this.entry_point);
        this.output_list = [];
        this.isDone = false;
    }

    async run(){
        for(let i = 0; i< this.process_list.length; i++){
            await this.detect_type_and_run(this.process_list[i])
        }
        this.isDone = true
        this.scraper.quit();
        return this.output_list;
    }

    async detect_type_and_run(json_object){
        const process_type = json_object.type;
        if (process_type === 'click'){
            this.process_click(json_object);

        }else if (process_type === 'read'){
            let read_result = await this.process_read(json_object);
            this.output_list.push(read_result);

        }else if (process_type === 'parent_list'){
            let list_read_result = await this.process_parent_list(json_object);
            this.output_list.push(list_read_result);
        }else{
            console.log('에러임');
        }
    }

    async process_read(json_object){
        const process_type = json_object.type;
        if (process_type !== 'read'){
            console.log('에러임');
        }
        const css_selector = json_object.css_selector;
        const inner_attribute = json_object.inner_attribute;
        let text = await this.scraper.find_one_element_and_get_text(css_selector);
        return text;
    }

    process_click(json_object){
        const process_type = json_object.type;
        const css_selector = json_object.css_selector;
        const inner_attribute = json_object.object.inner_attribute;

    }

    async process_parent_list(json_object){
        const process_type = json_object.type;
        if (process_type !== 'parent_list'){
            console.log('에러임');
        }
        const css_selector = json_object.css_selector;
        const childs = json_object.childs;
        let parent_list = await this.scraper.find_one_element(css_selector);
        if(childs.length === 0){
            return null;
        }else if(childs.length === 1){
            const child = childs[0];
            const child_css_selector = child.css_selector;
            const child_inner_attribute = child.inner_attribute;

            let li_parent_css_selector = await guiScraper.get_tail_css_selector(child_css_selector);

            let list_items = await this.scraper.find_many_elements(li_parent_css_selector, parent_list);
            let process_output = [];
            for (let i=0; i<list_items.length; i++){
                try{
                    let text = await list_items[i].getText();
                    process_output.push(text);
                }catch(e){
                    continue;
                }
            }
            return process_output;
        }else{
            let css_selector_list = [];
            for(let i=0; i<childs.length; i++){
                css_selector_list.push(childs[i].css_selector);
            }
            let li_parent_css_selector = guiScraper.longest_same_prefix(css_selector_list);
            console.log(li_parent_css_selector);
            let list_items = await this.scraper.find_many_elements(li_parent_css_selector);
            let process_output = [];

            if (list_items.length === 1){
                const first_id = childs[0].css_selector.split('>')[0];
                let element = await this.scraper.find_one_element(first_id);
                let tag_name = await element.getTagName();
                for(let i=0; i<childs.length; i++){
                    let splited_selector = childs[i].css_selector.split('>');
                    let new_css_selector = "";
                    for(let j=0; j<splited_selector.length; j++){
                        if (j === 0){
                            new_css_selector += tag_name;
                        }else{
                            new_css_selector += ' > ' + splited_selector[j];
                        }
                    }
                    childs[i].css_selector = new_css_selector;
                }
                css_selector_list = [];
                for(let i=0; i<childs.length; i++){
                    css_selector_list.push(childs[i].css_selector);
                }
                li_parent_css_selector = guiScraper.longest_same_prefix(css_selector_list);
                console.log(li_parent_css_selector);
                list_items = await this.scraper.find_many_elements(li_parent_css_selector, parent_list);
                console.log(list_items.length)
            }

            for (let i=0; i<list_items.length; i++){
                let inner_process_output = [];
                for(let j=0; j<childs.length; j++){
                    let child_css_selector = childs[j].css_selector.split(li_parent_css_selector);
                    const element = await this.scraper.find_one_element(child_css_selector[0], list_items[i]);
                    let text = await element.getText();
                    inner_process_output.push(text);
                }
                process_output.push(inner_process_output);
            }
            return process_output;
        }
    }
};


module.exports = json_parser;