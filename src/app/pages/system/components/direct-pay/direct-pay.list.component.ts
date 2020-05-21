import { Component, ViewEncapsulation, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { DirectPayService } from './direct-pay.service';

import 'style-loader!./direct-pay.scss';

@Component({
    selector: 'direct-pay-list',
    templateUrl: './direct-pay.list.html',
})
export class DirectPayListComponent {
    @ViewChild('deleteModal') deleteModal: ModalDirective;

    directPayes: any;
    selectedDirectPay: any;

    constructor(private directPayService: DirectPayService) { }

    ngOnInit() {
        this.getAll();
    }

    getAll(){
        this.directPayes = this.directPayService.getAll();
    }

    showDeleteModal(directPay) {
        this.selectedDirectPay = directPay;
        this.deleteModal.show();
    }

    deleteDirectPay() {
        this.directPayService.delete(this.selectedDirectPay._id).subscribe(() => {
            this.getAll();
            this.deleteModal.hide();
        });
    }

    showViewModal(directPay) { }
}