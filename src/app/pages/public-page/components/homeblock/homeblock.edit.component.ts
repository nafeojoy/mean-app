import { Component, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { NgUploaderOptions } from 'ngx-uploader';
import { Location } from '@angular/common';

import { HomeblockService } from './homeblock.service';

@Component({
    selector: 'homeblock-edit',
    templateUrl: './homeblock.edit.html',
})
export class HomeblockEditComponent {
    homeblock: any = {};
    public images: any;

    public defaultPicture = 'assets/img/theme/book-no-photo.jpg';
    public profile: any = {
        picture: 'assets/img/theme/book-no-photo.jpg'
    };

    public img_id: any;
    public uploaderOptions: NgUploaderOptions;

    constructor(private route: ActivatedRoute, private router: Router,
        private homeblockService: HomeblockService, private location: Location) { }

    imageUploaded(path) {
        let response = JSON.parse(path.response);
        let imagePath = response[0].filename;
        if (imagePath) {
            this.homeblock.homeblock_thumbnail_path = imagePath;
        }
    }

    ngOnInit() {
        let homeblockId = this.route.snapshot.params['id'];
        this.uploaderOptions = { url: this.homeblockService.uploadApiBaseUrl + 'upload/api/upload/homeblock' };
        if (homeblockId) {
            this.homeblockService.get(homeblockId).subscribe((res) => {
                this.homeblock = res;
                this.profile.picture=this.homeblock.image? "/image/homeblock/"+this.homeblock.image: 'assets/img/theme/book-no-photo.jpg';
            });
        }
    }

    updateHomeblock() {
        this.homeblockService.update(this.homeblock).subscribe(() => {
            this.location.back();
        })
    }
}