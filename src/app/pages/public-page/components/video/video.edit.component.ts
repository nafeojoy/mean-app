import { Component, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { NgUploaderOptions } from 'ngx-uploader';
import { Location } from '@angular/common';

import { VideoService } from './video.service';

@Component({
    selector: 'video-edit',
    templateUrl: './video.edit.html',
})
export class VideoEditComponent {
    video: any = {};
    public images: any;

    public defaultPicture = 'assets/img/theme/book-no-photo.jpg';
    public profile: any = {
        picture: 'assets/img/theme/book-no-photo.jpg'
    };

    public img_id: any;
    public uploaderOptions: NgUploaderOptions;

    constructor(private route: ActivatedRoute, private router: Router,
        private videoService: VideoService, private location: Location) { }

    imageUploaded(path) {
        let response = JSON.parse(path.response);
        let imagePath = response[0].filename;
        if (imagePath) {
            this.video.video_thumbnail_path = imagePath;
        }
    }

    ngOnInit() {
        let videoId = this.route.snapshot.params['id'];
        this.uploaderOptions = { url: this.videoService.uploadApiBaseUrl + 'upload/api/upload/video' };
        if (videoId) {
            this.videoService.get(videoId).subscribe((res) => {
                this.video = res;
                this.profile.picture=this.video.image? "/image/video/"+this.video.image: 'assets/img/theme/book-no-photo.jpg';
            });
        }
    }

    updateVideo() {
        this.videoService.update(this.video).subscribe(() => {
            this.location.back();
        })
    }
}