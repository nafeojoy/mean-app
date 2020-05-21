import { Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {Location} from "@angular/common";
import { StaticContentService } from './static-content.service'
import { LanguageService } from '../../../system/components/languages/language.service'
import { AppState } from '../../../../app.service';

import 'style-loader!./static-content.scss';

@Component({
    selector: 'static-content-add',
    templateUrl: './static-content.add.html',
})
export class StaticContentAddComponent {
    public ckeditorContent: any;
    public config;
    public languages: any = [];
    public staticContent: any = {};
    private defaultLanguage: any;
    constructor(private staticContentService: StaticContentService, private languageService: LanguageService, private location: Location, private appState: AppState) { }
    ngOnInit() {
        this.config = {
            uiColor: '#F0F3F4',
            height: '400'
        };
        this.defaultLanguage = this.appState.defaultLanguageCode;
        this.languageService.getAll().subscribe(result => {
            this.languages = result;
            for (let i in this.languages) {
                let code = this.languages[i].code;
                this.staticContent[code] = {};
            }
        })
    }

    save() {
        let contentObject = { content_url: this.staticContent.content_url, title: '', meta_tag_title: '', meta_tag_description: '', meta_tag_keywords: '', content: '', lang: [] };
        for (var key in this.staticContent) {
            if (this.staticContent.hasOwnProperty(key)) {
                if (key == this.defaultLanguage) {
                    contentObject.title = this.staticContent[key].title;
                    contentObject.meta_tag_title = this.staticContent[key].meta_tag_title;
                    contentObject.meta_tag_description = this.staticContent[key].meta_tag_description;
                    contentObject.meta_tag_keywords = this.staticContent[key].meta_tag_keywords;
                    contentObject.content = this.staticContent[key].content;
                } else {
                    if (key != 'content_url') {
                        let langObject = { code: '', content: { title: '', meta_tag_title: '', meta_tag_description: '', meta_tag_keywords: '', content: '' } };
                        langObject.code = key;
                        langObject.content.title = this.staticContent[key].title;
                        langObject.content.meta_tag_title = this.staticContent[key].meta_tag_title;
                        langObject.content.meta_tag_description = this.staticContent[key].meta_tag_description;
                        langObject.content.meta_tag_keywords = this.staticContent[key].meta_tag_keywords;
                        langObject.content.content = this.staticContent[key].content;
                        contentObject.lang.push(langObject);
                    }
                }
            }
        }
        this.staticContentService.add(contentObject).subscribe(result => {
            if(result._id){
                alert('New Content saved successfully.');
                this.location.back();
            }else{
                alert('Save dailed.');
            }
        })
    }

}