import { Component, ViewEncapsulation } from '@angular/core';
import { Location } from '@angular/common';
import { NgUploaderOptions } from 'ngx-uploader';

import { HomeblockService } from './homeblock.service';

@Component({
    selector: 'homeblock-add',
    templateUrl: './homeblock.add.html',
})
export class HomeblockAddComponent {
    homeblock: any = {};
    public images: any;

    public defaultPicture = 'assets/img/theme/book-no-photo.jpg';
    public profile: any = {
        picture: 'assets/img/theme/book-no-photo.jpg'
    };

    public img_id: any;
    public uploaderOptions: NgUploaderOptions;

    constructor(private homeblockService: HomeblockService, private location: Location) {
        this.homeblock.is_enabled = true;
    }

    ngOnInit() {
        this.uploaderOptions = { url: this.homeblockService.uploadApiBaseUrl + 'upload/api/upload/homeblock' };
    }

    imageUploaded(path) {
        let response = JSON.parse(path.response);
        let imagePath = response[0].filename;
        if (imagePath) {
            this.homeblock.homeblock_thumbnail_path = imagePath;
        }
    }

    addHomeblock() {
        this.homeblockService.add(this.homeblock).subscribe((result) => {
            alert("New Homeblock saved")
            this.location.back();
        })
    }
}