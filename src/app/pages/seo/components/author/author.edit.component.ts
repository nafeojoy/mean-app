import { Component, ViewEncapsulation, ViewChild } from "@angular/core";
import { ActivatedRoute } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { Location } from '@angular/common';

import { AuthorService } from "./author.service";
import { AuthorModelService } from "./author.model.service";
import { Subject } from 'rxjs/Subject';


import 'style-loader!./authors.scss';

@Component({
    selector: 'authors-edit',
    templateUrl: './author.edit.html',
})

export class AuthorEditComponent {

    public form: FormGroup;
    private author_id: string;
    public res_pending: boolean;

    author_name: any = {};
    author_description: any = {};
    author_meta_tag_title: any = {};
    author_meta_tag_description: any = {};
    author_meta_tag_keywords: any = {};
    author_seo_url: any = {};
    author: any = {};


    constructor(
        private authorService: AuthorService,
        private modelService: AuthorModelService,
        private route: ActivatedRoute,
        private location: Location
    ) { }

    ngOnInit() {

        this.form = this.modelService.getFormModel();
        let defaultLanguageCode = this.modelService.defaultLanguageCode;
        this.author_id = this.route.snapshot.params['id'];
        let result: any = JSON.parse(window.localStorage.getItem(this.author_id));
        this.author = result;
        console.log(this.author);


        this.author_name[defaultLanguageCode] = result.name;
        this.author_description[defaultLanguageCode] = result.description;
        this.author_meta_tag_title[defaultLanguageCode] = result.meta_tag_title;
        this.author_meta_tag_description[defaultLanguageCode] = result.meta_tag_description;
        this.author_meta_tag_keywords[defaultLanguageCode] = result.meta_tag_keywords;
        this.author_seo_url[defaultLanguageCode] = result.seo_url;

        let languages = result.lang;

        for (var i in languages) {
            this.author_name[languages[i].code] = languages[i].content.name;
            this.author_description[languages[i].code] = languages[i].content.description;
            this.author_meta_tag_title[languages[i].code] = languages[i].content.meta_tag_title;
            this.author_meta_tag_description[languages[i].code] = languages[i].content.meta_tag_description;
            this.author_meta_tag_keywords[languages[i].code] = languages[i].content.meta_tag_keywords;
            this.author_seo_url[languages[i].code] = languages[i].content.seo_url;
        }
    }


    update() {
        this.res_pending = true;

        let author = this.modelService.getFormValue(this.form);
        author._id = this.author_id;

        this.authorService.update(author).subscribe(result => {
            this.res_pending = false;
            if (result._id) {
                alert("Author Update Success!");
                this.location.back();
            } else if (result.duplicate) {
                alert(result.message);
            } else {
                alert("Author Update Failed!");
            }
        })

    }

}