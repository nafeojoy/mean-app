import { Component, ViewEncapsulation, ViewChild } from "@angular/core";
import { ActivatedRoute } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { Location } from '@angular/common';

import { CategoryService } from "./category.service";
import { CategoryModelService } from "./category.model.service";
import { Subject } from 'rxjs/Subject';


import 'style-loader!./categorys.scss';

@Component({
    selector: 'categorys-edit',
    templateUrl: './category.edit.html',
})

export class CategoryEditComponent {

    public form: FormGroup;
    private category_id: string;
    public res_pending: boolean;

    category_name: any = {};
    category_description: any = {};
    category_meta_tag_title: any = {};
    category_meta_tag_description: any = {};
    category_meta_tag_keywords: any = {};
    category_seo_url: any = {};
    category: any = {};


    constructor(
        private categoryService: CategoryService,
        private modelService: CategoryModelService,
        private route: ActivatedRoute,
        private location: Location
    ) { }

    ngOnInit() {

        this.form = this.modelService.getFormModel();
        let defaultLanguageCode = this.modelService.defaultLanguageCode;
        this.category_id = this.route.snapshot.params['id'];
        let result: any = JSON.parse(window.localStorage.getItem(this.category_id));
        this.category = result;

        this.category_name[defaultLanguageCode] = result.name;
        this.category_description[defaultLanguageCode] = result.description;
        this.category_meta_tag_title[defaultLanguageCode] = result.meta_tag_title;
        this.category_meta_tag_description[defaultLanguageCode] = result.meta_tag_description;
        this.category_meta_tag_keywords[defaultLanguageCode] = result.meta_tag_keywords;
        this.category_seo_url[defaultLanguageCode] = result.seo_url;

        let languages = result.lang;

        for (var i in languages) {
            this.category_name[languages[i].code] = languages[i].content.name;
            this.category_description[languages[i].code] = languages[i].content.description;
            this.category_meta_tag_title[languages[i].code] = languages[i].content.meta_tag_title;
            this.category_meta_tag_description[languages[i].code] = languages[i].content.meta_tag_description;
            this.category_meta_tag_keywords[languages[i].code] = languages[i].content.meta_tag_keywords;
            this.category_seo_url[languages[i].code] = languages[i].content.seo_url;
        }


    }


    update() {
        this.res_pending = true;

        let category = this.modelService.getFormValue(this.form);
        category._id = this.category_id;

        this.categoryService.update(category).subscribe(result => {
            this.res_pending = false;
            if (result._id) {
                alert("Category Update Success!");
                this.location.back();
            } else if (result.duplicate) {
                alert(result.message);
            } else {
                alert("Category Update Failed!");
            }
        })

    }

}