import { Component, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { NgUploaderOptions } from 'ngx-uploader';
import { Location } from '@angular/common';

import { BannerService } from './banner.service';

@Component({
    selector: 'banner-edit',
    templateUrl: './banner.edit.html',
})
export class BannerEditComponent {
    banner: any = {};
    public images: any;

    public defaultPicture = 'assets/img/theme/book-no-photo.jpg';
    public profile: any = {
        picture: 'assets/img/theme/book-no-photo.jpg'
    };

    public img_id: any;
    public uploaderOptions: NgUploaderOptions;

    constructor(private route: ActivatedRoute, private router: Router,
        private bannerService: BannerService, private location: Location) { }

    imageUploaded(path) {
        let response = JSON.parse(path.response);
        let imagePath = response[0].filename;
        if (imagePath) {
            this.banner.image = imagePath;
        }
    }

    ngOnInit() {
        let bannerId = this.route.snapshot.params['id'];
        this.uploaderOptions = { url: this.bannerService.uploadApiBaseUrl+'banner' };
        if (bannerId) {
            this.bannerService.get(bannerId).subscribe((res) => {
                this.banner = res;
                this.profile.picture=this.banner.image? "/image/banner/"+this.banner.image: 'assets/img/theme/book-no-photo.jpg';
            });
        }
    }

    updateBanner() {
        this.bannerService.update(this.banner).subscribe(() => {
            this.location.back();
        })
    }
}