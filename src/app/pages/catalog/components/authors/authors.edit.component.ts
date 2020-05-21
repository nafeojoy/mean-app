import { Component, ViewEncapsulation, ViewChild } from "@angular/core";
import { FormGroup, FormControl, FormArray, FormBuilder, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { BbImageUploader } from '../../../../shared/components/bb-image-uploader';
import { AuthorService } from "./authors.service";
import { AuthorModelService } from './authors.model.service';
import { NationalityService } from "./nationality.service"

import 'style-loader!./authors.scss';

@Component({
    selector: 'authors-edit',
    templateUrl: './authors.edit.html',
})

export class AuthorsEditComponent {
    public form: FormGroup;

    nationalities: any;
    public profile: any = {};
    public hasImage: boolean = false;
    @ViewChild('imageUploader') public _fileUpload: BbImageUploader;

    author_id: string;

    author_name: any = {};
    author_occupation: any = {};
    author_description: any = {};
    author_birth_place: any = {};
    author_meta_tag_title: any = {};
    author_meta_tag_description: any = {};
    author_meta_tag_keywords: any = {};
    author_seo_url: any = {};
    author_image: string;
    public uploaderOptions: any = {};
    public res_pending: boolean;

    constructor(private route: ActivatedRoute, private modelService: AuthorModelService,
        private authorService: AuthorService, private nationalityService: NationalityService, private location: Location) { }

    ngOnInit() {
        this.form = this.modelService.getFormModel();
        let defaultLanguageCode = this.modelService.defaultLanguageCode;
        let imageSize = '120X175'//this._cookieService.get('imageSize');
        this.author_id = this.route.snapshot.params['id'];
        // this.authorService.getById(this.author_id).subscribe((result) => {
        let result = JSON.parse(window.localStorage.getItem(this.author_id));
        this.uploaderOptions.url = 'author-update?import_id=' + result.import_id;
        this.author_image = result.image;
        this.profile.picture = result.image == undefined ? 'assets/img/theme/book-no-photo.jpg' : result.image[imageSize];

        this.form.controls['nationality'].setValue(result.nationality);
        this.form.controls['is_featured'].setValue(result.is_featured);
        this.form.controls['featured_order'].setValue(result.featured_order);

        this.author_name[defaultLanguageCode] = result.name;
        this.author_birth_place[defaultLanguageCode] = result.birth_place;
        this.author_occupation[defaultLanguageCode] = result.occupation;
        this.author_description[defaultLanguageCode] = result.description;
        this.author_meta_tag_title[defaultLanguageCode] = result.meta_tag_title;
        this.author_meta_tag_description[defaultLanguageCode] = result.meta_tag_description;
        this.author_meta_tag_keywords[defaultLanguageCode] = result.meta_tag_keywords;
        this.author_seo_url[defaultLanguageCode] = result.seo_url;

       
        let languages = result.lang;

        for (var i in languages) {
            this.author_name[languages[i].code] = languages[i].content.name;
            this.author_birth_place[languages[i].code] = languages[i].content.birth_place;
            this.author_occupation[languages[i].code] = languages[i].content.occupation;
            this.author_description[languages[i].code] = languages[i].content.description;
            this.author_meta_tag_title[languages[i].code] = languages[i].content.meta_tag_title;
            this.author_meta_tag_description[languages[i].code] = languages[i].content.meta_tag_description;
            this.author_meta_tag_keywords[languages[i].code] = languages[i].content.meta_tag_keywords;
            this.author_seo_url[languages[i].code] = languages[i].content.seo_url;
        }
        // })

        this.nationalities = this.nationalityService.getNationality();
    }


    public defaultPicture = 'assets/img/theme/book-no-photo.jpg';
    // public uploaderOptions: any = {
    //     url: 'author-upload',
    // };

    isImageChosen(status: boolean) { this.hasImage = status }

    updateAuthor() {
        let author = this.modelService.getFormValue(this.form);
        author._id = this.author_id;
        this.res_pending = true;
        if (this.hasImage) {
            this._fileUpload.uploadToServer().then((images) => {
                author.image = images;
                this.authorService.update(author).subscribe(result => {
                    this.res_pending = false;
                    if (result._id) {
                        alert("Author Update Success!");
                        this.location.back();
                    } else {
                        alert("Author Update Failed!");
                    }
                })
            });
        } else {
            author.image = this.author_image
            this.authorService.update(author).subscribe(result => {
                this.res_pending = false;
                if (result._id) {
                    alert("Author Update Success!");
                    this.location.back();
                } else {
                    alert("Author Update Failed!");
                }
            })
        }
    }
}