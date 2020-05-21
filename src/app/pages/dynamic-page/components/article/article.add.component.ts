import { Component, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from "@angular/common";
import { ArticleService } from './article.service'
import { LanguageService } from '../../../system/components/languages/language.service'
import { AppState } from '../../../../app.service';

import { NgUploaderOptions } from 'ngx-uploader';

import 'style-loader!./article.scss';

@Component({
    selector: 'article-add',
    templateUrl: './article.add.html',
})
export class ArticleAddComponent {
    public ckeditorContent: any;
    public config;
    public languages: any = [];
    public Article: any = {};
    private defaultLanguage: any;
    public hasImage: boolean = false;

    public defaultPicture = 'assets/img/theme/book-no-photo.jpg';
    public profile: any = {
        picture: 'assets/img/theme/book-no-photo.jpg'
    };

    public img_id: any;
    public uploaderOptions: NgUploaderOptions;

    constructor(private ArticleService: ArticleService, private languageService: LanguageService, private location: Location, private appState: AppState) { }


    ngOnInit() {
        this.uploaderOptions = { url: this.languageService.uploadApiBaseUrl + 'article' };
        this.config = {
            uiColor: '#F0F3F4',
            height: '400'
        };
        this.defaultLanguage = this.appState.defaultLanguageCode;
        this.languageService.getAll().subscribe(result => {
            this.languages = result;
            for (let i in this.languages) {
                let code = this.languages[i].code;
                this.Article[code] = {};
            }
        })
    }

    imageUploaded(path) {
        let response = JSON.parse(path.response);
        let imagePath = response[0].filename;
        if (imagePath) {
            this.img_id = imagePath;
        }
    }

    save() {
        let contentObject = { content_url: this.Article.content_url, title: '', meta_tag_title: '', meta_tag_description: '', meta_tag_keywords: '', content: '', lang: [], image: '' };
        for (var key in this.Article) {
            if (this.Article.hasOwnProperty(key)) {
                if (key == this.defaultLanguage) {
                    contentObject.title = this.Article[key].title;
                    contentObject.meta_tag_title = this.Article[key].meta_tag_title;
                    contentObject.meta_tag_description = this.Article[key].meta_tag_description;
                    contentObject.meta_tag_keywords = this.Article[key].meta_tag_keywords;
                    contentObject.content = this.Article[key].content;
                    contentObject.image = this.img_id;

                } else {
                    if (key != 'content_url') {
                        let langObject = { code: '', content: { title: '', meta_tag_title: '', meta_tag_description: '', meta_tag_keywords: '', content: '' } };
                        langObject.code = key;
                        langObject.content.title = this.Article[key].title;
                        langObject.content.meta_tag_title = this.Article[key].meta_tag_title;
                        langObject.content.meta_tag_description = this.Article[key].meta_tag_description;
                        langObject.content.meta_tag_keywords = this.Article[key].meta_tag_keywords;
                        langObject.content.content = this.Article[key].content;
                        contentObject.image = this.img_id;

                        contentObject.lang.push(langObject);
                    }
                }
            }
        }
        this.ArticleService.add(contentObject).subscribe(result => {
            if (result._id) {
                alert('New Content saved successfully.');
                this.location.back();
            } else {
                alert('Save failed.');
            }
        })



    }



}