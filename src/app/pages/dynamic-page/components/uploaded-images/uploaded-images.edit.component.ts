import { Component, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { NgUploaderOptions } from 'ngx-uploader';
import { Location } from '@angular/common';

import { UploadedImagesService } from './uploaded-images.service';

@Component({
    selector: 'uploaded-images-edit',
    templateUrl: './uploaded-images.edit.html',
})
export class UploadedImagesEditComponent {
    uploaded_images: any = {};
    public images: any;

    public defaultPicture = 'assets/img/theme/book-no-photo.jpg';
    public profile: any = {
        picture: 'assets/img/theme/book-no-photo.jpg'
    };

    public img_id: any;
    public uploaderOptions: NgUploaderOptions;

    constructor(private route: ActivatedRoute, private router: Router,
        private uploadedImagesService: UploadedImagesService, private location: Location) { }

    imageUploaded(path) {
        let response = JSON.parse(path.response);
        let imagePath = response[0].filename;
        if (imagePath) {
            this.uploaded_images.image = imagePath;
        }
    }

    ngOnInit() {
        let uploaded_imagesId = this.route.snapshot.params['id'];
        this.uploaderOptions = { url: this.uploadedImagesService.uploadApiBaseUrl + 'uploaded-images' };
        if (uploaded_imagesId) {
            this.uploadedImagesService.get(uploaded_imagesId).subscribe((res) => {
                this.uploaded_images = res;
                this.profile.picture=this.uploaded_images.image? "/image/uploaded-images/"+this.uploaded_images.image: 'assets/img/theme/book-no-photo.jpg';
            });
        }
    }

    updateUploadedImages() {
        this.uploadedImagesService.update(this.uploaded_images).subscribe(() => {
            this.location.back();
        })
    }
}