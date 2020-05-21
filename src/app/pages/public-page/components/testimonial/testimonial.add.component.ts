import { Component, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from "@angular/common";

import { TestimonialService } from './testimonial.service'
import { BbImageUploader } from '../../../../shared/components/bb-image-uploader';

import 'style-loader!./testimonial.scss';

@Component({
    selector: 'testimonial-add',
    templateUrl: './testimonial.add.html',
})
export class TestimonialAddComponent {

    public testimonial: any = {};
    public hasImage: boolean = false;

    @ViewChild('imageUploader') public _fileUpload: BbImageUploader;

    constructor(private testimonialService: TestimonialService, private location: Location) { }

    public defaultPicture = 'assets/img/theme/book-no-photo.jpg';
    public profile: any = {
        picture: 'assets/img/theme/book-no-photo.jpg'
    };
    public uploaderOptions: any = {
        url: 'testimonial-upload'
    };
    isImageChosen(status: boolean) { this.hasImage = status }


    addTestimonial(data) {
        let testimonial = data;
        if (this.hasImage) {
            this._fileUpload.uploadToServer().then((images) => {
                testimonial.image = images;
                this.testimonialService.add(testimonial).subscribe(response => {
                    if (response._id) {
                        alert("New testimonial saved successfully!");
                        this.location.back();
                    } else {
                        alert("Saved Failed!")
                    }
                })
            });
        } else {
            this.testimonialService.add(testimonial).subscribe(response => {
                if (response._id) {
                    alert("New testimonial saved successfully!");
                    this.location.back();
                } else {
                    alert("Saved Failed!")
                }
            })
        }
    }
}