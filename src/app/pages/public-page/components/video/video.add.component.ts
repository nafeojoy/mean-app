import { Component, ViewEncapsulation } from '@angular/core';
import { Location } from '@angular/common';
import { NgUploaderOptions } from 'ngx-uploader';

import { VideoService } from './video.service';

@Component({
    selector: 'video-add',
    templateUrl: './video.add.html',
})
export class VideoAddComponent {
    video: any = {};
    public images: any;

    public defaultPicture = 'assets/img/theme/book-no-photo.jpg';
    public profile: any = {
        picture: 'assets/img/theme/book-no-photo.jpg'
    };

    public img_id: any;
    public uploaderOptions: NgUploaderOptions;

    constructor(private videoService: VideoService, private location: Location) {
        this.video.is_enabled = true;
    }

    ngOnInit() {
        this.uploaderOptions = { url: this.videoService.uploadApiBaseUrl + 'upload/api/upload/video' };
    }

    imageUploaded(path) {
        let response = JSON.parse(path.response);
        let imagePath = response[0].filename;
        if (imagePath) {
            this.video.video_thumbnail_path = imagePath;
        }
    }

    addVideo() {
        this.videoService.add(this.video).subscribe((result) => {
            alert("New Video saved")
            this.location.back();
        })
    }
}