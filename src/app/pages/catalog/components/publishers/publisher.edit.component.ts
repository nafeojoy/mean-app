import { Component, ViewEncapsulation, ViewChild } from "@angular/core";
import { FormGroup, FormBuilder, FormArray, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { BbImageUploader } from '../../../../shared/components/bb-image-uploader';
import { PublisherService } from "./publisher.service";
import { PublisherModelService } from './publisher.model.service';
import { AuthorService } from "../authors/authors.service";

import 'style-loader!./publisher.scss';

@Component({
    selector: 'publishers-edit',
    templateUrl: './publisher.edit.html',
})

export class PublisherEditComponent {
    public form: FormGroup;
    public profile: any = {};
    public hasImage: boolean = false;
    @ViewChild('imageUploader') public _fileUpload: BbImageUploader;

    private publisher_id: string;
    publisher_name: any = {};
    publisher_description: any = {};
    publisher_meta_tag_title: any = {};
    publisher_meta_tag_description: any = {};
    publisher_meta_tag_keywords: any = {};
    publisher_seo_url: any = {};
    public res_pending: boolean;
    public uploaderOptions: any = {};
    public authorList: any = [];


    publisher_logo: string;

    constructor(
        private route: ActivatedRoute,
        private modelService: PublisherModelService,
        private publisherService: PublisherService,
        private location: Location,
        private authorService: AuthorService
    ) { }

    ngOnInit() {
        this.form = this.modelService.getFormModel();
        let defaultLanguageCode = this.modelService.defaultLanguageCode;
        let imageSize = '120X175'//this._cookieService.get('imageSize');
        this.publisher_id = this.route.snapshot.params['id'];
        this.publisherService.setId(this.publisher_id);
        let result: any = JSON.parse(window.localStorage.getItem(this.publisher_id));
        this.publisher_logo = result.logo;
        this.profile.picture = result.logo == undefined || '' ? 'assets/img/theme/book-no-photo.jpg' : result.logo;
        this.uploaderOptions.url = 'publisher-update?import_id=' + result.import_id;
        this.form.controls['phone'].setValue(result.phone);
        this.form.controls['email'].setValue(result.email);
        this.form.controls['address'].setValue(result.address);
        this.form.controls['page_url'].setValue(result.page_url);
        this.form.controls['is_author'].setValue(result.is_author);
        this.form.controls['website'].setValue(result.website);
        this.form.controls['is_enabled'].setValue(result.is_enabled);
        this.form.controls['is_featured'].setValue(result.is_featured);
        this.form.controls['featured_order'].setValue(result.featured_order);
        this.form.controls['order'].setValue(result.order);

        this.publisher_name[defaultLanguageCode] = result.name;
        this.publisher_description[defaultLanguageCode] = result.description;
        this.publisher_meta_tag_title[defaultLanguageCode] = result.meta_tag_title;
        this.publisher_meta_tag_description[defaultLanguageCode] = result.meta_tag_description;
        this.publisher_meta_tag_keywords[defaultLanguageCode] = result.meta_tag_keywords;
        this.publisher_seo_url[defaultLanguageCode] = result.seo_url;

        let languages = result.lang;

        for (var i in languages) {
            this.publisher_name[languages[i].code] = languages[i].content.name;
            this.publisher_description[languages[i].code] = languages[i].content.description;
            this.publisher_meta_tag_title[languages[i].code] = languages[i].content.meta_tag_title;
            this.publisher_meta_tag_description[languages[i].code] = languages[i].content.meta_tag_description;
            this.publisher_meta_tag_keywords[languages[i].code] = languages[i].content.meta_tag_keywords;
            this.publisher_seo_url[languages[i].code] = languages[i].content.seo_url;
        }
    }

    public defaultPicture = 'assets/img/theme/book-no-photo.jpg';
    isImageChosen(status: boolean) { this.hasImage = status }
    searchAuthor(text) {
        this.authorService.getSearch(text).subscribe((result) => {
            this.authorList = result.items;
        })
    }
    updatePublisher() {
        this.res_pending = true;
        let publisher = this.modelService.getFormValue(this.form);
        publisher._id = this.publisher_id;
        if (publisher.is_author) {
            publisher.author = publisher.author ? publisher.author._id : undefined;
          }
        if (this.hasImage) {
            this._fileUpload.uploadToServer().then((images) => {
                publisher.logo = images;
                this.publisherService.update(publisher).subscribe(result => {
                    this.res_pending = false;
                    if (result._id) {
                        alert("Publisher Update Success!");
                        this.location.back();
                    } else {
                        alert("Publisher Update Failed!");
                    }
                })
            });
        } else {
            publisher.logo = this.publisher_logo
            this.publisherService.update(publisher).subscribe(result => {
                this.res_pending = false;
                if (result._id) {
                    alert("Publisher Update Success!");
                    this.location.back();
                } else {
                    alert("Publisher Update Failed!");
                }
            })
        }
    }
}