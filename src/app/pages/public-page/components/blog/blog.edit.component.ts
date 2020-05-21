import { Component, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { NgUploaderOptions } from 'ngx-uploader';
import { Location } from '@angular/common';

import { BlogService } from './blog.service';

@Component({
    selector: 'blog-edit',
    templateUrl: './blog.edit.html',
})
export class BlogEditComponent {
    blog: any = {};
    public images: any;

    public defaultPicture = 'assets/img/theme/book-no-photo.jpg';
    public profile: any = {
        picture: 'assets/img/theme/book-no-photo.jpg'
    };

    public img_id: any;
    public uploaderOptions: NgUploaderOptions;

    constructor(private route: ActivatedRoute, private router: Router,
        private blogService: BlogService, private location: Location) { }

    imageUploaded(path) {
        let response = JSON.parse(path.response);
        let imagePath = response[0].filename;
        if (imagePath) {
            this.blog.blog_thumbnail_path = imagePath;
        }
    }

    ngOnInit() {
        let blogId = this.route.snapshot.params['id'];
        this.uploaderOptions = { url: this.blogService.uploadApiBaseUrl+'upload/api/upload/blog' };
        if (blogId) {
            this.blogService.get(blogId).subscribe((res) => {
                this.blog = res;
                this.profile.picture=this.blog.image? "/image/blog/"+this.blog.image: 'assets/img/theme/book-no-photo.jpg';
            });
        }
    }

    updateBlog() {
        this.blogService.update(this.blog).subscribe(() => {
            this.location.back();
        })
    }
}