import { Component, ViewEncapsulation } from '@angular/core';
import { Location } from '@angular/common';
import { NgUploaderOptions } from 'ngx-uploader';

import { PromotionalImageService } from './promotional-image.service';

@Component({
    selector: 'promotional-image-add',
    templateUrl: './promotional-image.add.html',
})
export class PromotionalImageAddComponent {
    promotionalImage: any = {};
    public images: any;

    public defaultPicture = 'assets/img/theme/book-no-photo.jpg';
    public profile: any = {
        picture: 'assets/img/theme/book-no-photo.jpg'
    };

    public img_id: any;
    public uploaderOptions: NgUploaderOptions;

    constructor(private promotionalImageService: PromotionalImageService, private location: Location) {
        this.promotionalImage.is_enabled = true;
    }

    ngOnInit() {
        this.uploaderOptions = { url: this.promotionalImageService.uploadApiBaseUrl + 'promotional-image' };
    }

    imageUploaded(path) {
        let response = JSON.parse(path.response);
        let imagePath = response[0].filename;
        if (imagePath) {
            this.promotionalImage.image = imagePath;
        }
    }

    addPromotionalImage() {
        this.promotionalImageService.add(this.promotionalImage).subscribe((result) => {
            alert("New PromotionalImage saved")
            this.location.back();
        })
    }
}