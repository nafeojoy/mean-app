import { Component, ViewEncapsulation } from '@angular/core';
import { Location } from '@angular/common';
import { NgUploaderOptions } from 'ngx-uploader';

import { UploadedImagesService } from './uploaded-images.service';

@Component({
    selector: 'uploaded-images-add',
    templateUrl: './uploaded-images.add.html',
})
export class UploadedImagesAddComponent {
    uploaded_images: any = {};
    public images: any;

    public defaultPicture = 'assets/img/theme/book-no-photo.jpg';
    public profile: any = {
        picture: 'assets/img/theme/book-no-photo.jpg'
    };

    public img_id: any;
    public uploaderOptions: NgUploaderOptions;

    constructor(private uploadedImagesService: UploadedImagesService, private location: Location) {
        this.uploaded_images.is_enabled = true;
    }

    ngOnInit() {
        this.uploaderOptions = { url: this.uploadedImagesService.uploadApiBaseUrl + 'uploaded-images' };
    }

    imageUploaded(path) {
        let response = JSON.parse(path.response);
        let imagePath = response[0].filename;
        if (imagePath) {
            this.uploaded_images.image = imagePath;
        }
    }

    addUploadedImages() {
        this.uploadedImagesService.add(this.uploaded_images).subscribe((result) => {
            alert("New Image saved")
            this.location.back();
        })
    }
}