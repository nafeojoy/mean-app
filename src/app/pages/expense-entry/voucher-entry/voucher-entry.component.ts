import { Component, ViewChild } from "@angular/core";
import { VoucherEntryService } from './voucher-entry.service';
import { ModalDirective } from 'ngx-bootstrap';


@Component({
  selector: 'voucher-entry',
  templateUrl: './voucher-entry.html',
  styleUrls: ['./voucher-entry.scss']
})

export class VoucherEntryComponent {

  @ViewChild('costCenterAddModal') costCenterAddModal: ModalDirective;

  public alerts: any = [];
  public voucher: any = {};
  public isSubmited: boolean;
  public voucher_types: any = [];
  public fiscal_years: any = [];
  public transactions: any = [];
  public accounts: any = [];
  public costcenters: any = [];
  public selecetdIndex: number;
  cost_center: any = {};

  public vouchers: any = [];
  public totalItems: number = 0;
  public currentPage: number = 1;
  public maxSize: number = 5;
  public itemsPerPage: number = 10;

  constructor(
    private _voucherEntryService: VoucherEntryService
  ) { }

  ngOnInit() {
    this._voucherEntryService.getLeafAccountAndCost().subscribe((result: any) => {
      if (result.success) {
        this.accounts = result.accounts;
        this.costcenters = result.costcenters;
      }
    })
    this.getVouchers();
    this.initVoucher();
  }

  initVoucher() {
    this.voucher = { fiscal_year: '2019-2020', voucher_date: this.currentDate() };
    this.voucher_types = voucher_types;
    this.fiscal_years = fiscal_years;
    this.transactions = [{
      account_id: '',
      debit: 0,
      credit: 0,
      responsible_center: ''
    },
    {
      account_id: '',
      debit: 0,
      credit: 0,
      responsible_center: ''
    }];
    this.updateTotal();
  }

  getVouchers() {
    this._voucherEntryService.getAll(this.currentPage).subscribe((result) => {
      if (result.success) {
        this.totalItems = result.count;
        this.vouchers = result.vouchers;
      }
    })
  }

  pageChanged(pageNo) {
    this.currentPage = pageNo;
    this.getVouchers();
  }

  showViewModal() {
    console.log("Show Voucher");
  }

  currentDate() {
    const currentDate = new Date();
    return currentDate.toISOString().substring(0, 10);
  }

  refresh(index) {
    this.transactions[index] = {
      account_id: '',
      debit: 0,
      credit: 0,
      responsible_center: ''
    }
    this.updateTotal();
  }

  add(index) {
    localStorage.setItem('collections', JSON.stringify(this.transactions));
    this.transactions = [];
    let arr = JSON.parse(localStorage.getItem('collections'));
    arr.splice(index + 1, 0, {
      account_name: '',
      debit: 0,
      credit: 0,
      responsible_center: ''
    })
    this.transactions = arr;
  }

  remove(index) {
    if (this.transactions.length > 1) {
      this.transactions.splice(index - 1, 1);
      this.updateTotal();
    }
  }

  updateTotal() {
    this.voucher.total_debit = 0;
    this.voucher.total_credit = 0;
    this.transactions.map(trans => {
      if (!isNaN(trans.debit) && trans.debit > 0)
        this.voucher.total_debit += trans.debit
      if (!isNaN(trans.credit) && trans.credit > 0)
        this.voucher.total_credit += trans.credit
    })
  }

  onSelectCostCenter(transaction, i) {
    if (transaction.responsible_center == 'add') {
      this.selecetdIndex = i;
      this.costCenterAddModal.show();
    }
  }

  addCostCenter() {
    if (this.cost_center && this.cost_center.name) {
      this.cost_center.name = this.cost_center.name.trim();
      if (this.cost_center.name.length > 1) {
        this._voucherEntryService.addCostCenter(this.cost_center).subscribe(result => {
          if (result._id) {
            this.costcenters.push(result);
            this.transactions[this.selecetdIndex].responsible_center = result._id;
            this.costCenterAddModal.hide();
          }
        })
      }
    }
  }

  cancel() {
    this.costCenterAddModal.hide();
  }

  save() {
    this.isSubmited = true;
    let validEntry = this.transactions.filter(entry => {
      return entry.account_id && !isNaN(entry.debit) && !isNaN(entry.credit) && (entry.debit > 0 || entry.credit > 0) && entry.responsible_center
    })
    if (this.voucher.voucher_type && this.voucher.baf_no && this.voucher.total_debit == this.voucher.total_credit) {
      let data = this.voucher;
      data.entry = this.transactions;
      this.isSubmited = false;
      if (validEntry.length > 1) {
        this._voucherEntryService.add(data).subscribe(result => {
          if (result.success) {
            this.currentPage = 1;
            this.getVouchers();
            this.initVoucher();
            this.alerts.push({
              type: 'info',
              msg: "Voucher entry saved.",
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
      } else {
        this.alerts.push({
          type: 'danger',
          msg: "No valid entry found!",
          timeout: 4000
        });
      }
    } else {
      this.alerts.push({
        type: 'danger',
        msg: "Voucher contain invalid data.",
        timeout: 4000
      });
    }
  }


  resetForm() {
    if (confirm("Are you sure to reset form?")) {
      this.initVoucher();
    }
  }


}


const voucher_types = [{
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


const fiscal_years = [{
  name: "2017-2018",
  value: "2017-2018"
},
{
  name: "2018-2019",
  value: "2018-2019"
},
{
  name: "2019-2020",
  value: "2019-2020"
},
{
  name: "2020-2021",
  value: "2020-2021"
}]