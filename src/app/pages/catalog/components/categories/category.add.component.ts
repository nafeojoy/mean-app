import { Component, ViewEncapsulation, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FormGroup, FormControl, FormArray, FormBuilder, Validators } from '@angular/forms';
import { BbImageUploader } from '../../../../shared/components/bb-image-uploader';

import { CategoryService } from './category.service';
import { CategoryModelService } from './category.model.service';

import 'style-loader!./category.scss';

@Component({
    selector: 'category-add',
    templateUrl: './category.add.html',
})
export class CategoryAddComponent {
    public form: FormGroup;
    paramCategory: any;
    categories: any;
    public res_pending: boolean;
    public hasImage: boolean = false;
    @ViewChild('imageUploader') public _fileUpload: BbImageUploader;

    constructor(private route: ActivatedRoute, private categoryService: CategoryService,
        private modelService: CategoryModelService, private location: Location) {
        this.categories = this.categoryService.categories;
    }

    ngOnInit() {
        this.form = this.modelService.getFormModel();
        let parentCategoryId = this.route.snapshot.params['id'];

        if (parentCategoryId) {
            this.form.controls['parent'].setValue(parentCategoryId);
        }

        this.categoryService.getAllCats();
    }

    public defaultPicture = 'assets/img/theme/book-no-photo.jpg';
    public profile: any = {
        picture: 'assets/img/theme/book-no-photo.jpg'
    };
    public uploaderOptions: any = {
        url: 'category-upload',
    };
    isImageChosen(status: boolean) { this.hasImage = status }


    addCategory() {
        this.res_pending = true;
        let category = this.modelService.getFormValue(this.form);

        if (this.hasImage) {
            this._fileUpload.uploadToServer().then((images) => {
                category.image = images;
                this.categoryService.add(category).subscribe(result => {
                    this.res_pending = false;
                    if (result._id) {
                        alert("Category Save Success!");
                        this.location.back();
                    } else {
                        alert("Category Save Failed!");
                    }
                })
            });
        } else {
            this.categoryService.add(category).subscribe(result => {
                this.res_pending = false;
                if (result._id) {
                    alert("Category Save Success!");
                    this.location.back();
                } else {
                    alert("Category Save Failed!");
                }
            })
        }
    }
}