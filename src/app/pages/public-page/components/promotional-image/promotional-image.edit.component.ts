import { Component, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { NgUploaderOptions } from 'ngx-uploader';
import { Location } from '@angular/common';

import { PromotionalImageService } from './promotional-image.service';

@Component({
    selector: 'promotional-image-edit',
    templateUrl: './promotional-image.edit.html',
})
export class PromotionalImageEditComponent {
    promotionalImage: any = {};
    public images: any;

    public defaultPicture = 'assets/img/theme/book-no-photo.jpg';
    public profile: any = {
        picture: 'assets/img/theme/book-no-photo.jpg'
    };

    public img_id: any;
    public uploaderOptions: NgUploaderOptions;

    constructor(private route: ActivatedRoute, private router: Router,
        private promotionalImageService: PromotionalImageService, private location: Location) { }

    imageUploaded(path) {
        let response = JSON.parse(path.response);
        let imagePath = response[0].filename;
        if (imagePath) {
            this.promotionalImage.image = imagePath;
        }
    }

    ngOnInit() {
        let promotionalImageId = this.route.snapshot.params['id'];
        this.uploaderOptions = { url: this.promotionalImageService.uploadApiBaseUrl + 'promotional-image' };
        if (promotionalImageId) {
            this.promotionalImageService.get(promotionalImageId).subscribe((res) => {
                this.promotionalImage = res;
                this.profile.picture=this.promotionalImage.image? "/image/promotional-image/"+this.promotionalImage.image: 'assets/img/theme/book-no-photo.jpg';
            });
        }
    }

    updatePromotionalImage() {
        this.promotionalImageService.update(this.promotionalImage).subscribe(() => {
            this.location.back();
        })
    }
}