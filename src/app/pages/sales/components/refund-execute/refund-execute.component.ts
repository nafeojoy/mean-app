import { Component, ViewEncapsulation, ViewChild, Input } from "@angular/core";
import { RefundExecuteService } from './refund-execute.service';
import { Subject } from 'rxjs';
import { NgForm } from '@angular/forms';
@Component({
    selector: "refund-execute",
    templateUrl: "./refund-execute.html"
})
export class RefundExecuteComponent {

    @ViewChild('refundExecuteForm') public refundExecuteForm: NgForm;



    payment_types = [
        'via SSL',
        'via bKash'
    ];
    refundList: any;
    selectedRefund: any = {};
    selectedPaymentType: any;
    refund_info: any = {};
    refund_id: any;

    responseMessage: string = '';

    public filter: any = {};
    repost_data: any = [];


    public err_message: string;
    public print_disabled: boolean = false;
    public res_pending: boolean;


    constructor(public _RefundExecuteService: RefundExecuteService) {
        this._RefundExecuteService.getSearchedRefund(this.filter)
            .subscribe(res => {
                this.repost_data = res.data;
                //console.log(this.refundList)
            })
    }

    ngOnInit() {
        this.refund_info.payer_name = "Sabur";
        this.filter.not_executed = true;
    }

    changeType(active_status) {
        if (active_status == 'all_request') {
            this.filter.not_executed = false;
            this.filter.executed = false;
            this.filter.all_request = true;

        } else if (active_status == 'not_executed') {
            this.filter.not_executed = true;
            this.filter.executed = false;
            this.filter.all_request = false;
        } else if (active_status == 'executed') {
            this.filter.not_executed = false;
            this.filter.executed = true;
            this.filter.all_request = false;
        }

    }

    reset() {
        this.print_disabled = false;
        this.filter = { not_executed: true, executed: false, all_request: false, from_date: undefined, to_date: undefined };
    }

    getRefund(_id) {
        this.refund_id = _id;
        this._RefundExecuteService.getRefund(_id)
            .subscribe(result => {
                this.selectedRefund = result.data;
            })
    }

    refundExecute(data) {

        if (this.selectedPaymentType && data.payer_name && data.executed_at && ((data.bkash_tran_id && data.bkash_from_no && data.bkash_to_no) || data.ssl_ref_id)) {
            data.refund_id = this.refund_id;
            this._RefundExecuteService.executeRefund(data)
                .subscribe(result => {
                    //console.log(result);
                    if (result.success) {
                        this.refundExecuteForm.reset();
                        document.getElementById("responseMsg").style.color = "green";
                        this.responseMessage = 'Request executed successfully';

                        this._RefundExecuteService.getSearchedRefund(this.filter)
                            .subscribe(res => {
                                this.repost_data = res.data;
                                //console.log(this.refundList)
                            })
                    } else {
                        document.getElementById("responseMsg").style.color = "red";
                        this.responseMessage = 'Execution is unsuccessful';
                    }
                })
        } else {
            document.getElementById("responseMsg").style.color = "red";
            this.responseMessage = 'Please provide all the necessary information';
        }
    }

    submitReportdata() {

        this._RefundExecuteService.getSearchedRefund(this.filter)
            .subscribe(res => {
                this.repost_data = res.data;
                //console.log(this.refundList)
            })

    }


    print(): void {
        let printContents, popupWin;
        printContents = document.getElementById('print-section').innerHTML;
        popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
        popupWin.document.open();
        popupWin.document.write(`
      <html>
        <head>
          <style>
              @media print
                {     
                    table{ width:100%;}
                    .table-id{width:5%;}
                    .report-code{width:11%;}
                    .report-name{width:12%;}
                    .report-rat{width:12%;}
                    .report-quenty{width:25%;}
                    .report-price{width:10%;}
                    .report-total_amount{width:25%;}
                    .report_header h3{ text-align:center;}
                    .payment-head-img{ width:50%;}
                    .payment-head-content{ width:50%; text-align:right;}
                    .purched_mode_border{border:1px solid #ccc; padding-left:10px;}
                    .no-display{display:none}
                }

              table{ width:100%;}
              .table-hover{}
              .table-hover tr th{text-align:left;border-bottom:1px solid #ccc; border-top:1px solid #ccc; padding-top:8px; padding-bottom:8px;}
              .table-hover tr td{border-bottom:1px solid #ccc; padding-top:8px; padding-bottom:8px;}
              .payment-head-img{ width:50%;}
              .payment-head-content{ width:50%; text-align:right;}
              .table thead tr th { text-align: center; }
              .table tbody tr td { text-align: center; }
          </style>
        </head>
    <body onload="window.print();window.close()">${printContents}</body>
      </html>`
        );
        popupWin.document.close();
    }


}
function search(_id, myArray) {
    for (var i = 0; i < myArray.length; i++) {
        if (myArray[i]._id == _id) {
            return myArray[i];
        }
    }
}