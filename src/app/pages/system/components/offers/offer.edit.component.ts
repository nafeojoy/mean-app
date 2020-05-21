import { Component, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';

import { OfferService } from './offer.service';

@Component({
    selector: 'offer-edit',
    templateUrl: './offer.edit.html',
})
export class OfferEditComponent {
    currentOffer: any = {};

    constructor(private route: ActivatedRoute, private router: Router,
        private offerService: OfferService, private location: Location) { }

    ngOnInit() {
        let offerId = this.route.snapshot.params['id'];

        if (offerId) {
            this.offerService.get(offerId).subscribe((res) => {
                this.currentOffer = res
            });
        }
    }

    editOffer() {
        this.offerService.update(this.currentOffer).subscribe(() => {
            this.location.back();
        })
    }
}