import { Component, ViewEncapsulation } from '@angular/core';
import { Location } from '@angular/common';
import { NgUploaderOptions } from 'ngx-uploader';

import { OfferService } from './offer.service';

@Component({
    selector: 'offer-add',
    templateUrl: './offer.add.html',
})
export class OfferAddComponent {
    newOffer: any = {};
    public images: any;

    public defaultPicture = 'assets/img/theme/book-no-photo.jpg';
    public profile: any = {
        picture: 'assets/img/theme/book-no-photo.jpg'
    };

    public img_id: any;
    public uploaderOptions: NgUploaderOptions;

    constructor(private offerService: OfferService, private location: Location) {
        this.newOffer.is_enabled = true;
    }

    ngOnInit() {
        this.uploaderOptions = { url: this.offerService.uploadApiBaseUrl+'offer' };
    }

    imageUploaded(path) {
        let response = JSON.parse(path.response);
        let imagePath = response[0].filename;
        if (imagePath) {
            this.newOffer.image = imagePath;
        }
    }

    addOffer() {
        this.offerService.add(this.newOffer).subscribe((result) => {
            alert("New Offer saved")
            this.location.back();
        })
    }
}