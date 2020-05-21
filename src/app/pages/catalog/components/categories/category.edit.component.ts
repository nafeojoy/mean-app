import { Component, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { FormGroup, FormBuilder, FormArray, Validators, FormControl } from '@angular/forms';
import { Location } from '@angular/common';
import { BbImageUploader } from '../../../../shared/components/bb-image-uploader';

import { CategoryModelService } from './category.model.service';
import { CategoryService } from './category.service';
import { ProductService } from '../products/products.service';

import 'style-loader!./category.scss';
import { NgUploaderOptions } from 'ngx-uploader';

@Component({
    selector: 'category-add',
    templateUrl: './category.edit.html'
})
export class CategoryEditComponent {
    public form: FormGroup;

    category_image: string;
    public uploaderOptions: any = {};
    public profile: any = {};
    public hasImage: boolean = false;
    @ViewChild('imageUploader') public _fileUpload: BbImageUploader;
    public banneruploaderOptions: NgUploaderOptions;
    uploadedBanner: string;

    public defaultPicture = 'assets/img/theme/book-no-photo.jpg';
    isImageChosen(status: boolean) { this.hasImage = status }
    public related_products: any = [];
    private categoryId: string;
    category_banner: string;
    category_name: any = {};
    category_meta_tag_title: any = {};
    category_meta_tag_description: any = {};
    category_meta_tag_keywords: any = {};
    category_seo_url: any = {};
    original_result: any = {};
    public res_pending: boolean;

    constructor(private route: ActivatedRoute, private categoryService: CategoryService,
        private productService: ProductService, private modelService: CategoryModelService, private location: Location) { }

    ngOnInit() {
        this.form = this.modelService.getFormModel();
        let defaultLanguageCode = this.modelService.defaultLanguageCode;
        this.banneruploaderOptions = { url: this.productService.uploadApiBaseUrl + 'category/banner' };

        //Image
        let imageSize = '120X175'//this._cookieService.get('imageSize');
        this.categoryId = this.route.snapshot.params['id'];

        let result = JSON.parse(window.localStorage.getItem(this.categoryId));
        this.uploaderOptions.url = 'category-update?import_id=' + result.import_id;
        this.uploadedBanner = result.banner;
        this.category_image = result.image;
        this.profile.picture = result.image == undefined ? 'assets/img/theme/book-no-photo.jpg' : result.image[imageSize];

        // parent category (optional)

        this.related_products = this.productService.getProductByCategory(this.categoryId);


        this.original_result = JSON.parse(window.localStorage.getItem(this.categoryId));
        this.form.controls['description'].setValue(result.description);
        this.form.controls['order'].setValue(result.order);
        this.form.controls['is_enabled'].setValue(result.is_enabled);
        this.form.controls['hide_on_public'].setValue(result.hide_on_public);
        this.form.controls['book'].setValue(result.featured_item ? result.featured_item : 'empty');

        this.category_name[defaultLanguageCode] = result.name;
        this.category_meta_tag_title[defaultLanguageCode] = result.meta_tag_title;
        this.category_meta_tag_description[defaultLanguageCode] = result.meta_tag_description;
        this.category_meta_tag_keywords[defaultLanguageCode] = result.meta_tag_keywords;
        this.category_seo_url[defaultLanguageCode] = result.seo_url;

        let languages = result.lang;

        for (var i in languages) {
            this.category_name[languages[i].code] = languages[i].content.name;
            this.category_meta_tag_title[languages[i].code] = languages[i].content.meta_tag_title;
            this.category_meta_tag_description[languages[i].code] = languages[i].content.meta_tag_description;
            this.category_meta_tag_keywords[languages[i].code] = languages[i].content.meta_tag_keywords;
            this.category_seo_url[languages[i].code] = languages[i].content.seo_url;
        }
        // })
    }

    imageUploaded(path) {
        let response = JSON.parse(path.response);
        let imagePath = response[0].filename;
        if (imagePath) {
            this.category_banner = `/images/category/banner/${imagePath}`;
        }
    }

    updateCategory() {
        let category = this.modelService.getFormValue(this.form);
        category._id = this.categoryId;
        category.is_show_home_tab = this.original_result.is_show_home_tab;
        category.is_show_feature_tab = this.original_result.is_show_feature_tab;
        category.banner = this.category_banner ? this.category_banner : undefined;
        this.res_pending = true;

        if (this.hasImage) {
            this._fileUpload.uploadToServer().then((images) => {
                category.image = images;
                this.categoryService.update(category).subscribe(result => {
                    this.res_pending = false;
                    if (result._id) {
                        alert("Category Update Successful!");
                        this.location.back();
                    } else {
                        alert("Category Update Failed!");
                    }
                })
            });
        } else {
            category.image = this.category_image
            this.categoryService.update(category).subscribe(result => {
                this.res_pending = false;
                if (result._id) {
                    alert("Category Update Successful!");
                    this.location.back();
                } else {
                    alert("Category Update Failed!");
                }
            })
        }
    }

}