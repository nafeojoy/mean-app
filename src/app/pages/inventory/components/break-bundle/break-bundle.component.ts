import { Component, ViewEncapsulation, ViewChild } from "@angular/core";
import { BreakBundleService } from './break-bundle.service';
import { Router } from '@angular/router';
import { DatePipe } from "@angular/common";
import { ModalDirective } from 'ng2-bootstrap';

// import 'style-loader!./find-bkash-orderid.scss';

@Component({
    selector: 'break-bundle',
    templateUrl: './break-bundle.html',
    styleUrls: ['./break-bundle.scss']
})

export class BreakBundleComponent {


    public searchValue


    @ViewChild('updatesModal') updatesModal: ModalDirective;


    constructor(private _breakBundleService: BreakBundleService) { }

    ngOnInit() {
    }


    getBundleInfo(){
        this._breakBundleService.getBundle(this.searchValue).subscribe(result => {                       
                // this.orderIdBkash = '';               
                // let orderid = result.data[0] ? result.data[0].order_no:  undefined;
                // if(orderid == undefined){
                //     this.orderIdBkash = 'No Data Found';
                // }
                // else{
                //     this.orderIdBkash = orderid;
                // }                
            }
          );
      }
    
    

}