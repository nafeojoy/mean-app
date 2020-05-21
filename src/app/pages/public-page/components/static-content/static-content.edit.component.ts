import { Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {Location} from "@angular/common";
import { StaticContentService } from './static-content.service'
import { LanguageService } from '../../../system/components/languages/language.service'
import { AppState } from '../../../../app.service';

import 'style-loader!./static-content.scss';

@Component({
    selector: 'static-content-edit',
    templateUrl: './static-content.edit.html'
})
export class StaticContentEditComponent {

    public _id: any;
    public staticContent: any = {};
    public defaultLanguage: string;
    public config: any = {};
    public languages: any = [];
    constructor(private languageService: LanguageService, private route: ActivatedRoute, private location: Location, private staticContentService: StaticContentService, private appState: AppState) { }

    ngOnInit() {
        this.config = {
            uiColor: '#F0F3F4',
            height: '400'
        };
        this.defaultLanguage = this.appState.defaultLanguageCode;
        this._id = this.route.snapshot.params['id'];
        this.languageService.getAll().subscribe(result => {
            this.languages = result;
            for (let i in this.languages) {
                let code = this.languages[i].code;
                this.staticContent[code] = {};
            }

            this.staticContentService.getById(this._id).subscribe((result) => {
                this.staticContent.content_url = result.content_url;
                this.staticContent[this.defaultLanguage].title = result.title;
                this.staticContent[this.defaultLanguage].meta_tag_title = result.meta_tag_title;
                this.staticContent[this.defaultLanguage].meta_tag_description = result.meta_tag_description;
                this.staticContent[this.defaultLanguage].meta_tag_keywords = result.meta_tag_keywords;
                this.staticContent[this.defaultLanguage].content = result.content;
                var languages = result.lang;
                for (var i in languages) {
                    var code = languages[i].code;
                    this.staticContent[code].title = languages[i].content.title;
                    this.staticContent[code].meta_tag_title = languages[i].content.meta_tag_title;
                    this.staticContent[code].meta_tag_description = languages[i].content.meta_tag_description;
                    this.staticContent[code].meta_tag_keywords = languages[i].content.meta_tag_keywords;
                    this.staticContent[code].content = languages[i].content.content;
                }
            })
        })
    }

    save() {
        let contentObject = { _id: this._id, content_url: this.staticContent.content_url, title: '', meta_tag_title: '', meta_tag_description: '', meta_tag_keywords: '', content: '', lang: [] };
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
        this.staticContentService.update(contentObject).subscribe(result => {
            if(result._id){
                alert('New Content saved successfully.');
                this.location.back();
            }else{
                alert('Save dailed.');
            }
        })
    }
}