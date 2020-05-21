import { Component, ViewEncapsulation, ViewChild } from "@angular/core";
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';
import { ChartOfAccountService } from '../chart-of-account.service';


@Component({
    selector: 'chart-of-account-edit',
    templateUrl: './chart-of-account-edit.html',
    styleUrls: ['./chart-of-account-edit.scss']
})
export class ChartOfAccountEditComponent {

    public account: any = { parent: {} };
    public alerts: any = [];
    voucher_types: any = [];

    constructor(
        private _chartOfAccountService: ChartOfAccountService,
        private route: ActivatedRoute,
        private location: Location
    ) { }

    ngOnInit() {
        let account_id = this.route.snapshot.params['id'];
        this.voucher_types = [{
            name: "CP- Cahs Payment",
            value: "CP"
        }, {
            name: "BR- Bank Receive",
            value: "BR"
        }, {
            name: "BP- Bank Payment",
            value: "BP"
        }, {
            name: "JV- Journal Voucher",
            value: "JV"
        }, {
            name: "CV- Cash Voucher",
            value: "Cv"
        }, {
            name: "CR- Cash Receive",
            value: "CR"
        }, {
            name: "SV- Sales Voucher",
            value: "SV"
        }]
        this._chartOfAccountService.get(account_id).subscribe(result => {
            this.account = result;
        })
    }


    updateAccount() {
        this._chartOfAccountService.update(this.account).subscribe(result => {
            if (result._id) {
                this.location.back();
            } else {
                this.alerts.push({
                    type: 'danger',
                    msg: result.message,
                    timeout: 4000
                });
            }
        })

    }
}