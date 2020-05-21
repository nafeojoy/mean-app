import { Component, ViewEncapsulation, ViewChild } from "@angular/core";
import { FormGroup, FormBuilder, FormArray, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Location } from "@angular/common";
import { TestimonialService } from './testimonial.service';
import { BbImageUploader } from '../../../../shared/components/bb-image-uploader';

import 'style-loader!./testimonial.scss';

@Component({
    selector: 'testimonial-edit',
    templateUrl: './testimonial.edit.html',
})
export class TestimonialEditComponent {

    public profile: any = {};
    public _id: string;
    public testimonial: any = {};
    public hasImage: boolean;
    public uploaderOptions: any = {};

    @ViewChild('imageUploader') public _fileUpload: BbImageUploader;

    constructor(private route: ActivatedRoute, private testimonialService: TestimonialService,  private location: Location) { }

    ngOnInit() {
        let imageSize = '300X300';
        this._id = this.route.snapshot.params['id'];
        this.testimonialService.getById(this._id).subscribe((result) => {
            this.testimonial = result;
            this.uploaderOptions.url = 'testimonial-update?import_id=' + result.import_id;
            this.profile.picture = result.image == undefined ? 'assets/img/theme/book-no-photo.jpg' : result.image[imageSize];
        })
    }

    public defaultPicture = 'assets/img/theme/book-no-photo.jpg';

    isImageChosen(status: boolean) { this.hasImage = status }

    updateTestimonial(data) {
        let testimonial = data;
        if (this.hasImage) {
            this._fileUpload.uploadToServer().then((images) => {
                testimonial.image = images;
                this.testimonialService.update(testimonial).subscribe(response => {
                    if (response._id) {
                        alert("Testimonial updated successfully!");
                        this.location.back();
                    } else {
                        alert("Saved Failed!")
                    }
                })
            });
        } else {
            this.testimonialService.update(testimonial).subscribe(response => {
                if (response._id) {
                    alert("Testimonial updated successfully!");
                    this.location.back();
                } else {
                    alert("Saved Failed!")
                }
            })
        }
    }
}