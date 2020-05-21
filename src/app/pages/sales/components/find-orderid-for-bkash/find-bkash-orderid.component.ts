import { Component, ViewEncapsulation, ViewChild } from "@angular/core";
import { FindBkashService } from './find-bkash-orderid.service';
import { Router } from '@angular/router';
import { DatePipe } from "@angular/common";
import { ModalDirective } from 'ng2-bootstrap';

import 'style-loader!./find-bkash-orderid.scss';

@Component({
    selector: 'find-bkash-orderid',
    templateUrl: './find-bkash-orderid.html',
})

export class FindOrderIdComponent {


    public transactionId;
    public orderIdBkash;


    @ViewChild('updatesModal') updatesModal: ModalDirective;


    constructor(private _findBkashService: FindBkashService) { }

    ngOnInit() {
    }
    
    getOrderIdBkash(){
        this._findBkashService.getOrderId(this.transactionId).subscribe(result => {
           
                this.orderIdBkash = '';
                
                let orderid = result.data[0] ? result.data[0].order_no:  undefined;
                if(orderid == undefined){
                    this.orderIdBkash = 'No Data Found';
                }
                else{
                    this.orderIdBkash = orderid;
                }
                
                
            }
          );
      }

}