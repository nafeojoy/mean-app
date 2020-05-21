import { Component, ViewEncapsulation, ViewChild } from "@angular/core";
import { ActivatedRoute } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { Location } from '@angular/common';

import { ProductService } from "./products.service";
import { ProductModelService } from "./products.model.service";
import { Subject } from 'rxjs/Subject';


import 'style-loader!./products.scss';

@Component({
    selector: 'products-edit',
    templateUrl: './products.edit.html',
})

export class ProductEditComponent {

    public form: FormGroup;
    private product_id: string;
    public res_pending: boolean;

    product_name: any = {};
    product_description: any = {};
    product_meta_tag_title: any = {};
    product_meta_tag_description: any = {};
    product_meta_tag_keywords: any = {};
    product_seo_url: any = {};
    product: any = {};


    constructor(
        private productService: ProductService,
        private modelService: ProductModelService,
        private route: ActivatedRoute,
        private location: Location
    ) { }

    ngOnInit() {

        this.form = this.modelService.getFormModel();
        let defaultLanguageCode = this.modelService.defaultLanguageCode;
        this.product_id = this.route.snapshot.params['id'];
        let result: any = JSON.parse(window.localStorage.getItem(this.product_id));
        this.product = result;
        console.log(this.product);

        this.product_name[defaultLanguageCode] = result.name;
        this.product_description[defaultLanguageCode] = result.description;
        this.product_meta_tag_title[defaultLanguageCode] = result.meta_tag_title;
        this.product_meta_tag_description[defaultLanguageCode] = result.meta_tag_description;
        this.product_meta_tag_keywords[defaultLanguageCode] = result.meta_tag_keywords;
        this.product_seo_url[defaultLanguageCode] = result.seo_url;

        console.log(this.product_seo_url[defaultLanguageCode]);


        let languages = result.lang;

        for (var i in languages) {
            this.product_name[languages[i].code] = languages[i].content.name;
            this.product_description[languages[i].code] = languages[i].content.description;
            this.product_meta_tag_title[languages[i].code] = languages[i].content.meta_tag_title;
            this.product_meta_tag_description[languages[i].code] = languages[i].content.meta_tag_description;
            this.product_meta_tag_keywords[languages[i].code] = languages[i].content.meta_tag_keywords;
            this.product_seo_url[languages[i].code] = languages[i].content.seo_url;
            console.log(this.product_seo_url[languages[i].code]);

        }
    }

    update() {
        this.res_pending = true;

        let product = this.modelService.getFormValue(this.form);
        product._id = this.product_id;

        this.productService.update(product).subscribe(result => {
            this.res_pending = false;
            if (result._id) {
                alert("Product Update Success!");
                this.location.back();
            } else if (result.duplicate) {
                alert(result.message);
            } else {
                alert("Product Update Failed!");
            }
        })

    }

}