import { Component, ViewEncapsulation } from '@angular/core';
import { Location } from '@angular/common';
import { NgUploaderOptions } from 'ngx-uploader';

import { BlogService } from './blog.service';

@Component({
    selector: 'blog-add',
    templateUrl: './blog.add.html',
})
export class BlogAddComponent {
    blog: any = {};
    public images: any;

    public defaultPicture = 'assets/img/theme/book-no-photo.jpg';
    public profile: any = {
        picture: 'assets/img/theme/book-no-photo.jpg'
    };

    public img_id: any;
    public uploaderOptions: NgUploaderOptions;

    constructor(private blogService: BlogService, private location: Location) {
        this.blog.is_enabled = true;
    }

    ngOnInit() {
        this.uploaderOptions = { url: this.blogService.uploadApiBaseUrl + 'upload/api/upload/blog' };
    }

    imageUploaded(path) {
        let response = JSON.parse(path.response);
        let imagePath = response[0].filename;
        if (imagePath) {
            this.blog.blog_thumbnail_path = imagePath;
        }
    }

    addBlog() {
        this.blogService.add(this.blog).subscribe((result) => {
            alert("New Blog saved")
            this.location.back();
        })
    }
}