import { Component, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { NewsService } from './news.service';
import { LanguageService } from '../../../system/components/languages/language.service'
import { AppState } from '../../../../app.service';
import { BbImageUploader } from '../../../../shared/components/bb-image-uploader';

import 'style-loader!./news.scss';

@Component({
    selector: 'news-add',
    templateUrl: './news.add.html',
})
export class NewsAddComponent {
    public ckeditorContent: any;
    public config;
    public languages: any = [];
    public news: any = {};
    private defaultLanguage: any;

    public hasImage: boolean = false;
    @ViewChild('imageUploader') public _fileUpload: BbImageUploader;

    constructor(private newsService: NewsService, private languageService: LanguageService, private appState: AppState,private location: Location) { }
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
                this.news[code] = {};
            }
        })
    }

    public defaultPicture = 'assets/img/theme/book-no-photo.jpg';
    public profile: any = {
        picture: 'assets/img/theme/book-no-photo.jpg'
    };
    public uploaderOptions: any = {
        url: 'news-upload'
    };
    isImageChosen(status: boolean) { this.hasImage = status }



    save() {
        let newsObject = { headline: '', image: {}, content: '', lang: [] };
        for (var key in this.news) {
            if (this.news.hasOwnProperty(key)) {
                if (key == this.defaultLanguage) {
                    newsObject.headline = this.news[key].headline;
                    newsObject.content = this.news[key].content;
                } else {
                    let langObject = { code: '', content: { headline: '', content: '' } };
                    langObject.code = key;
                    langObject.content.headline = this.news[key].headline;
                    langObject.content.content = this.news[key].content;
                    newsObject.lang.push(langObject);
                }
            }
        }

        if (this.hasImage) {
            this._fileUpload.uploadToServer().then((images) => {
                newsObject.image = images;
                this.newsService.add(newsObject).subscribe(response => {
                    alert("Saved successfully");
                    this.location.back();
                })
            });
        } else {
            this.newsService.add(newsObject).subscribe(response => {
                alert("Saved successfully");
                this.location.back();
            })
        }
    }

}