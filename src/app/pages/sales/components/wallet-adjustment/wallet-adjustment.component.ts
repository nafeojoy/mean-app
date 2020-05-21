import { Component, ViewEncapsulation, ViewChild } from "@angular/core";
import { WalletAdjustmentService } from './wallet-adjustment.service';
import { Subject } from 'rxjs';
@Component({
    selector: "wallet-adjustment",
    templateUrl: "./wallet-adjustment.html"
})
export class WalletAdjustmentComponent {

    private user = JSON.parse(window.localStorage.getItem('user'));

    searchSubscriber$ = new Subject<string>();
    selectedSub: any = {};
    totalWalletAmount = 0;
    operations = [
        'Debit',
        'Credit'
    ];
    cr_types = [
        'Bonus',
        'Cancelled Order',
        'Split Order',
        'Voucher Card',
        'Online Payment',
        'bKash',
        'Order Return',
        'Book Return Cost',
        'Wallet Recharge',
        'Customer Expense',
        'Others'
    ]
    selectedOperation: any;
    selectedCr_type: any;
    wallet_info: any = {};
    subscriberList: Array<any> = [];
    updateData: any = {};
    walletHistory: any = [];
    responseMessage: string = '';
    subId: any;
    walletList: any;

    constructor(public _walletAdjustmentService: WalletAdjustmentService) {
        this._walletAdjustmentService.getAllWallet()
        .subscribe(res =>{
            this.walletList = res.data;
            //console.log(this.walletList)
        })
     }

    ngOnInit() {
        this._walletAdjustmentService.getSubscriberSearched(this.searchSubscriber$)
            .subscribe(result => {
                this.subscriberList = result.data
                console.log(this.subscriberList)
            });
    }

    walletUpdate() {


        if ((this.wallet_info.order_no || this.wallet_info.card_no) && this.wallet_info.cr_amount || (this.totalWalletAmount >= this.wallet_info.dr_amount)) {
            if (this.selectedCr_type == 'Voucher Card') {
                this.wallet_info.order_no = undefined;
            } else {
                this.wallet_info.card_no = undefined;
            }
            if (this.selectedOperation == 'Debit') {
                this.wallet_info.cr_amount = undefined;
            } else if (this.selectedOperation == 'Credit') {
                this.wallet_info.dr_amount = undefined;
            }
            this.updateData = {
                collection_type: this.selectedOperation,
                payment_type: this.selectedCr_type || 'Adjustment',
                wallet_info: this.wallet_info,
                user_info: this.user,
                subscriber_id: this.selectedSub._id
            }

            //console.log(this.updateData)


            this._walletAdjustmentService.walletUpdate(this.updateData)
                .subscribe(res => {

                    if (res.success) {
                        this.totalWalletAmount = 0;
                        document.getElementById("responseMsg").style.color = "green";
                        res.data.cr_balance_status.forEach(element => {
                            this.totalWalletAmount = this.totalWalletAmount + element.wallet_amount;
                        });
                        this.walletHistory =(res.data.cr_balance_status).reverse();

                    } else {
                        document.getElementById("responseMsg").style.color = "red";
                    }
                    this.responseMessage = res.message;
                    this.wallet_info = {};
                })
        } else if ((this.selectedCr_type == 'Others' || this.selectedCr_type == 'Book Return Cost' || this.selectedCr_type == 'Wallet Recharge' || this.selectedCr_type == 'Customer Expense' || this.selectedCr_type == 'Bonus' || this.selectedCr_type == 'bKash') && (!this.wallet_info.order_no && !this.wallet_info.card_no) && this.wallet_info.cr_amount) {
            this.updateData = {
                collection_type: this.selectedOperation,
                payment_type: this.selectedCr_type,
                wallet_info: this.wallet_info,
                user_info: this.user,
                subscriber_id: this.selectedSub._id
            }

           // console.log("LLL")

            this._walletAdjustmentService.walletUpdate(this.updateData)
                .subscribe(res => {

                    if (res.success) {
                        this.totalWalletAmount = 0;
                        document.getElementById("responseMsg").style.color = "green";
                        res.data.cr_balance_status.forEach(element => {
                            this.totalWalletAmount = this.totalWalletAmount + element.wallet_amount;
                        });
                        this.walletHistory =(res.data.cr_balance_status).reverse();
                    } else {
                        document.getElementById("responseMsg").style.color = "red";
                    }
                    this.responseMessage = res.message;
                    this.wallet_info = {};
                })
        }
        else {
           // console.log("MMM")

            document.getElementById("responseMsg").style.color = "red";
            this.responseMessage = "Wrong Input";
            this.wallet_info = {};
        }

        this._walletAdjustmentService.getSubscriberSearched(this.searchSubscriber$)
            .subscribe(result => {
                this.subscriberList = result.data;

            });

    }

    getSubscriber(id) {

        this.totalWalletAmount = 0;
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