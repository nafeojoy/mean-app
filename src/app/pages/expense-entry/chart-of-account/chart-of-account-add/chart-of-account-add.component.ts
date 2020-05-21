import { Component, ViewEncapsulation, ViewChild } from "@angular/core";
import { TreeNode, TREE_ACTIONS, KEYS, IActionMapping } from 'angular-tree-component';
import { ChartOfAccountService } from '../chart-of-account.service';

const actionMapping: IActionMapping = {
    mouse: {
        click: TREE_ACTIONS.FOCUS
    },
    keys: {
        [KEYS.ENTER]: (tree, node, $event) => alert(`This is ${node.data.name}`)
    }
}

@Component({
    selector: 'chart-of-account-add',
    templateUrl: './chart-of-account-add.html',
    styleUrls: ['./chart-of-account-add.scss']
})

export class ChartOfAccountAddComponent {

    public chartOfAccount: any = { data: { chartOfAccount: { selected: false, expanded: false } } };
    public nodes: any = [];
    public alerts: any = [];
    public selectedParent: any = {};
    public selectedPermission: {};
    public optionsModel: any[];
    public voucher_types: Array<any> = [];
    constructor(
        private _chartOfAccountService: ChartOfAccountService
    ) { }

    ngOnInit() {
        this.chartOfAccount.is_enabled = true;
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
        this._chartOfAccountService.getRoot().subscribe(result => {
            this.nodes = result;
        })
    }

    options = {
        actionMapping,
        getChildren: (node: TreeNode) => {
            return this.childTree(node.data._id).then(res => {
                return res;
            });
        }
    };

    childTree(id: any) {
        return new Promise((resolve, reject) => {
            this._chartOfAccountService.getChild(id).subscribe((res) => {
                resolve(res);
            });
        })
    }

    onEvent(ev: any) {
        let id = ev.node.data._id;
        this.selectedParent = ev.node.data;
        this.chartOfAccount.parent = ev.node.data;
    }

    createChartOfAccount() {
        if (this.chartOfAccount.parent && this.chartOfAccount.account_code && this.chartOfAccount.name) {
            this._chartOfAccountService.add(this.chartOfAccount).subscribe(result => {
                if (result._id) {
                    this._chartOfAccountService.getRoot().subscribe(result => {
                        this.nodes = result;
                    })
                    this.chartOfAccount = { is_enabled: true, data: { chartOfAccount: { selected: false, expanded: false } } };
                    this.selectedParent = {};
                    this.alerts.push({
                        type: 'info',
                        msg: 'New ChartOfAccount Saved',
                        timeout: 4000
                    });
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

    onChange(test) {
        console.log(test);
    }
}