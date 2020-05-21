import { Component, ViewEncapsulation, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { OfferService } from './offer.service';

@Component({
    selector: 'offer-list',
    templateUrl: './offer.list.html',
})
export class OfferListComponent {
    @ViewChild('deleteModal') deleteModal: ModalDirective;

    offers: any;
    selectedOffer: any;

    constructor(private offerService: OfferService) { }

    ngOnInit() {
        this.offers = this.offerService.getAll();
    }

    showDeleteModal(offer) {
        this.selectedOffer = offer;
        this.deleteModal.show();
    }

    deleteOffer() {
        this.offerService.delete(this.selectedOffer._id).subscribe(() => {
            this.deleteModal.hide();
        });
    }

    showViewModal(offer) {}
}