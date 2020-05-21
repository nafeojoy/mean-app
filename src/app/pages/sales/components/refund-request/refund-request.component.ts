import { Component, ViewEncapsulation, ViewChild } from "@angular/core";
import { RefundRequestService } from './refund-request.service';
import { Subject } from 'rxjs';
import { NgForm } from '@angular/forms';
@Component({
    selector: "refund-request",
    templateUrl: "./refund-request.html"
})
export class RefundRequestComponent {

    @ViewChild('refundForm') public refundForm: NgForm;
    

    searchSubscriber$ = new Subject<string>();
    selectedSub: any = {};
    totalWalletAmount = 0;
    preferred_refunds = [
        'Wallet',
        'Adjustment'
    ];
    refund_reasons = [
        'Book Unavailable',
        'Damaged Book',
        'Wrong Book',
        'Cancelled by Customer'
    ]


    subscriberList: Array<any> = [];
    updateData: any = {};
    walletHistory: any = [];
    responseMessage: string = '';
    subId: any;
    walletList: any;


    refund_info: any = {};
    selectedPreferred_refund: any;
    selectedRefund_reason: any;



    constructor(public _RefundRequestService: RefundRequestService) {
        
        // this._RefundRequestService.getAllRefund()
        // .subscribe(res =>{
        //     this.walletList = res.data;
        //     //console.log(this.walletList)
        // })
    }

    ngOnInit() {
        
        this._RefundRequestService.getRefundSearched(this.searchSubscriber$)
            .subscribe(result => {
                this.subscriberList = result.data
            });
    }


    addRefundRequest(data) {


        if (data.order_no && data.customer_mobile && data.refund_amount  && this.selectedRefund_reason) {
            let refundRequest = {
                order_no: data.order_no,
                refund_amount: data.refund_amount,
                customer_mobile: data.customer_mobile,
                refund_reason: this.selectedRefund_reason,
                // preferred_method: this.selectedPreferred_refund,
                refund_comment: data.refund_comment,
                admin_name: JSON.parse(localStorage.getItem('user')).name,
                created_by_admin: JSON.parse(localStorage.getItem('user')).id
            }


            this._RefundRequestService.addRefundRequest(refundRequest).subscribe((result) => {
                if (result.success == true) {
                    this.refundForm.reset();
                    document.getElementById("responseMsg").style.color = "green";
                    this.responseMessage = 'Refund requested successfully';
                }
                else {
                    document.getElementById("responseMsg").style.color = "red";
                    this.responseMessage = 'Request is unsuccessful';
                }
            })

        } else {
            document.getElementById("responseMsg").style.color = "red";
            this.responseMessage = 'Please provide all the necessary information';
        }


    }

    getRefundRequests(id) {

        this.selectedSub = search(id, this.subscriberList);
        this.subId = id;

        this.walletHistory = (this.selectedSub.cr_balance_status).reverse();

        this.selectedSub.cr_balance_status.forEach(element => {
            this.totalWalletAmount = this.totalWalletAmount + element.wallet_amount;
        });

    }



}
function search(_id, myArray) {
    for (var i = 0; i < myArray.length; i++) {
        if (myArray[i]._id == _id) {
            return myArray[i];
        }
    }
}