import { Component, ViewEncapsulation, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { OrderStatusService } from './order-status.service';

import 'style-loader!./order-status.scss';

@Component({
    selector: 'order-status-list',
    templateUrl: './order-status.list.html',
})
export class OrderStatusListComponent {
    @ViewChild('deleteModal') deleteModal: ModalDirective;

    orderStatuses: any;
    selectedOrderStatus: any;
    defaultLang: string;

    constructor(private orderStatusService: OrderStatusService) {
    }

    ngOnInit() {
        this.orderStatuses = this.orderStatusService.getAll();
        for (var key in localStorage) {
            if (key.length == 24) {
              localStorage.removeItem(key);
            }
          }
    }

    showDeleteModal(orderStatus) {
        this.selectedOrderStatus = orderStatus;
        this.deleteModal.show();
    }

    deleteOrderStatus() {
        this.orderStatusService.delete(this.selectedOrderStatus._id).subscribe(() => {
            this.deleteModal.hide();
        });
    }

    set(data) {
        window.localStorage.setItem(data._id, JSON.stringify(data));
      }

    showViewModal(orderStatus) { }
}