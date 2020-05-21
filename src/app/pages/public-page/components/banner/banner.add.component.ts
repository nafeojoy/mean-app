import { Component, ViewEncapsulation } from '@angular/core';
import { Location } from '@angular/common';
import { NgUploaderOptions } from 'ngx-uploader';

import { BannerService } from './banner.service';

@Component({
    selector: 'banner-add',
    templateUrl: './banner.add.html',
})
export class BannerAddComponent {
    banner: any = {};
    public images: any;

    public defaultPicture = 'assets/img/theme/book-no-photo.jpg';
    public profile: any = {
        picture: 'assets/img/theme/book-no-photo.jpg'
    };

    public img_id: any;
    public uploaderOptions: NgUploaderOptions;

    constructor(private bannerService: BannerService, private location: Location) {
        this.banner.is_enabled = true;
    }

    ngOnInit() {
        this.uploaderOptions = { url: this.bannerService.uploadApiBaseUrl+'banner' };
    }

    imageUploaded(path) {
        let response = JSON.parse(path.response);
        let imagePath = response[0].filename;
        if (imagePath) {
            this.banner.image = imagePath;
        }
    }

    addBanner() {
        this.bannerService.add(this.banner).subscribe((result) => {
            alert("New Banner saved")
            this.location.back();
        })
    }
}