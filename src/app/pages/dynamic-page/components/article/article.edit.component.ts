import { Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from "@angular/common";
import { ArticleService } from './article.service'
import { LanguageService } from '../../../system/components/languages/language.service'
import { AppState } from '../../../../app.service';

import { NgUploaderOptions } from 'ngx-uploader';


import 'style-loader!./article.scss';

@Component({
    selector: 'article-edit',
    templateUrl: './article.edit.html'
})
export class ArticleEditComponent {

    public _id: any;
    public Article: any = {};
    public defaultLanguage: string;
    public config: any = {};
    public languages: any = [];



    public defaultPicture = 'assets/img/theme/book-no-photo.jpg';
    public profile: any = {
        picture: 'assets/img/theme/book-no-photo.jpg'
    };

    public img_id: string;
    public uploaderOptions: NgUploaderOptions;

    constructor(private languageService: LanguageService, private route: ActivatedRoute, private location: Location, private ArticleService: ArticleService, private appState: AppState) { }

    imageUploaded(path) {
        let response = JSON.parse(path.response);
        let imagePath = response[0].filename;
        if (imagePath) {
            this.img_id = imagePath;
        }
    }

    ngOnInit() {
        this.uploaderOptions = { url: this.languageService.uploadApiBaseUrl +'article' };

        this.config = {
            uiColor: '#F0F3F4',
            height: '400'
        };
        this.defaultLanguage = this.appState.defaultLanguageCode;
        this._id = this.route.snapshot.params['id'];
        // this.languageService.getAll().subscribe(result => {
        this.languages = JSON.parse(window.localStorage.getItem("languages"));
        let result = JSON.parse(window.localStorage.getItem(this._id));

        this.profile.picture = result.image ? "/image/article/" + result.image : 'assets/img/theme/book-no-photo.jpg';
        this.img_id = result.image;
        for (let i in this.languages) {
            let code = this.languages[i].code;
            this.Article[code] = {};
        }

        // this.ArticleService.getById(this._id).subscribe((result) => {
        this.Article.content_url = result.content_url;
        this.Article[this.defaultLanguage].title = result.title;
        this.Article[this.defaultLanguage].meta_tag_title = result.meta_tag_title;
        this.Article[this.defaultLanguage].meta_tag_description = result.meta_tag_description;
        this.Article[this.defaultLanguage].meta_tag_keywords = result.meta_tag_keywords;
        this.Article[this.defaultLanguage].content = result.content;
        var languages = result.lang;
        for (var i in languages) {
            var code = languages[i].code;
            this.Article[code].title = languages[i].content.title;
            this.Article[code].meta_tag_title = languages[i].content.meta_tag_title;
            this.Article[code].meta_tag_description = languages[i].content.meta_tag_description;
            this.Article[code].meta_tag_keywords = languages[i].content.meta_tag_keywords;
            this.Article[code].content = languages[i].content.content;
        }
        //     })
        // })
    }

    save() {
        let contentObject = { _id: this._id, content_url: this.Article.content_url, title: '', meta_tag_title: '', meta_tag_description: '', meta_tag_keywords: '', content: '', lang: [], image: '' };
        for (var key in this.Article) {
            if (this.Article.hasOwnProperty(key)) {
                if (key == this.defaultLanguage) {
                    contentObject.title = this.Article[key].title;
                    contentObject.meta_tag_title = this.Article[key].meta_tag_title;
                    contentObject.meta_tag_description = this.Article[key].meta_tag_description;
                    contentObject.meta_tag_keywords = this.Article[key].meta_tag_keywords;
                    contentObject.content = this.Article[key].content;
                } else {
                    if (key != 'content_url') {
                        let langObject = { code: '', content: { title: '', meta_tag_title: '', meta_tag_description: '', meta_tag_keywords: '', content: '' } };
                        langObject.code = key;
                        langObject.content.title = this.Article[key].title;
                        langObject.content.meta_tag_title = this.Article[key].meta_tag_title;
                        langObject.content.meta_tag_description = this.Article[key].meta_tag_description;
                        langObject.content.meta_tag_keywords = this.Article[key].meta_tag_keywords;
                        langObject.content.content = this.Article[key].content;
                        contentObject.lang.push(langObject);
                    }
                }
            }
        }
        console.log(this.img_id);
        contentObject.image = this.img_id;
        console.log(contentObject);
        
        this.ArticleService.update(contentObject).subscribe(result => {
            if (result._id) {
                alert('Content updated successfully.');
                this.location.back();
            } else {
                alert('Update failed.');
            }
        })
    }
}