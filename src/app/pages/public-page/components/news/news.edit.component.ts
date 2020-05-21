import { Component, ViewEncapsulation, ViewChild } from "@angular/core";
import { FormGroup, FormBuilder, FormArray, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { NewsService } from './news.service';
import { LanguageService } from '../../../system/components/languages/language.service'
import { BbImageUploader } from '../../../../shared/components/bb-image-uploader';
import { AppState } from '../../../../app.service';

import 'style-loader!./news.scss';

@Component({
    selector: 'news-edit',
    templateUrl: './news.edit.html',
})

export class NewsEditComponent {
    public profile: any = {};
    public _id: any;
    public news: any = {};
    public defaultLanguage: string;
    public config: any = {};
    public languages: any = [];
    public uploaderOptions: any = {};
    public hasImage: boolean;
    @ViewChild('imageUploader') public _fileUpload: BbImageUploader;

    constructor(private languageService: LanguageService, private route: ActivatedRoute, private location: Location, private newsService: NewsService, private appState: AppState) { }

    ngOnInit() {
        this.config = {
            uiColor: '#F0F3F4',
            height: '400'
        };
        let imageSize = '150X150';
        this.defaultLanguage = this.appState.defaultLanguageCode;
        this._id = this.route.snapshot.params['id'];

        this.languageService.getAll().subscribe(rslt => {
            this.languages = rslt;
            for (let i in this.languages) {
                let code = this.languages[i].code;
                this.news[code] = {};
            }
            let result = JSON.parse(window.localStorage.getItem(this._id));
            this.profile.picture = result.image == undefined ? 'assets/img/theme/book-no-photo.jpg' : result.image[imageSize];
            this.uploaderOptions.url = 'news-update?import_id=' + result.import_id;
            this.news[this.defaultLanguage] = { headline: result.headline, content: result.content }
            var languages = result.lang;
            for (var i in languages) {
                var code = languages[i].code;
                this.news[code] = { headline: languages[i].content.headline, content: languages[i].content.content };
            }
        })
    }


    public defaultPicture = 'assets/img/theme/book-no-photo.jpg';

    isImageChosen(status: boolean) { this.hasImage = status }

    save() {
        let newsObject: any = { _id: this._id, lang: [] };
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
                this.newsService.update(newsObject).subscribe(response => {
                    alert('News Updated');
                    this.location.back();
                })
            });
        } else {
            this.newsService.update(newsObject).subscribe(response => {
                alert('News Updated');
                this.location.back();
            })
        }
    }
}