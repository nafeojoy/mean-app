import { Component, ViewChild } from '@angular/core';
import { PurchaseAcceptService } from './purchase-accept.service';
import { ModalDirective } from 'ng2-bootstrap';
import { Subject } from 'rxjs';
import { InventoryStore } from '../../inventory.store';
import { Location } from '@angular/common';

@Component({
    selector: 'general-purchase',
    templateUrl: './general-purchase.html',
    styleUrls: ['./purchase-accept.scss']
})
export class GeneralPurchaseComponent extends InventoryStore {

    @ViewChild('invoiceModal') invoiceModal: ModalDirective;
    @ViewChild('changeSupplierModal') changeSupplierModal: ModalDirective;
    public accept: any = { convenience: 0, courier_charge: 0, purchase_mode: 'Cash', purchase_date: new Date() };
    searchProduct$ = new Subject<string>();
    res_pending: boolean;
    purchaseInfo: any = {};
    final_purchase_items = [];
    //Supplier
    public supplier_info: any = {};
    public supplierList: any = [];
    public isSupplierSubmited: boolean;
    public new_supplier: any = {};
    public hideNewSupplierAdd: boolean;
    supplierSearchTerm$ = new Subject<string>();
    new_supp_item_index: number;


    //Author Filter
    authorDataList: Array<any> = [];
    public isAuthClear: boolean = false;
    public selectedAuthor: any = {}

    // product
    dataList: Array<any> = [];
    show_image: boolean = true;
    public selectedItems: any = [];
    public itemSelected: any = {};
    public total_cost: number = 0;
    public isClear: boolean = false;
    seo_url: any;
    check_negative_input: boolean = false;

    alerts: any = [];
    total_book

    constructor(
        private _purchaseAcceptService: PurchaseAcceptService,
        private location: Location
    ) {
        super();
        this._purchaseAcceptService.getSupplierSearched(this.supplierSearchTerm$)
            .subscribe(results => {
                this.supplierList = results.supplier;
            });

        this._purchaseAcceptService.getProductSearched(this.searchProduct$)
            .subscribe(result => {
                this.dataList = result
            });

    }

    ngOnInit() {

    }

    getSelectedSupplier(data) {
        this.new_supplier = data;
    }

    addSupp(item, index) {
        this.new_supp_item_index = index;
        this.changeSupplierModal.show();
    }

    closeSuppModal() {
        this.changeSupplierModal.hide();
    }

    changeSupp() {

        if (this.new_supplier._id) {
            this.selectedItems[this.new_supp_item_index].supplier = { _id: this.new_supplier._id, name: this.new_supplier.name }
            this.changeSupplierModal.hide();
            this.new_supplier = {};
            this.isClear = true;
            setTimeout(() => {
                this.isClear = false;
            }, 500);
        }
    }

    //Product
    getData(text) {
        let search_data: any = { text: text }
        if (this.selectedAuthor && this.selectedAuthor._id) {
            search_data.author = this.selectedAuthor._id;
        }
        this._purchaseAcceptService.getSearched(search_data).subscribe((result) => {
            this.dataList = result.product;
        })
    }


    getAuthorData(text) {
        this._purchaseAcceptService.getSearchedAuthor(text).subscribe((result) => {
            this.authorDataList = result.author
        })
    }

    getSelectedAuthor(data) {
        this.selectedAuthor = data;
    }

    getSelected(data) {
        this.itemSelected = data;

    }

    addItemToList() {

        if (this.itemSelected && this.itemSelected._id) {
            this.isClear = true;
            this.selectedAuthor = {};
            setTimeout(() => {
                this.isClear = false;
            }, 100)

            let itemRate;
            let itemWeight;
            if (this.itemSelected.purchase_history) {
                itemRate = this.itemSelected.purchase_history.price;
                itemWeight = this.itemSelected.purchase_history.weight;
            } else {
                itemRate = Math.ceil((this.itemSelected.price - (this.itemSelected.price * 35) / 100));
                itemWeight = 0;
            }


            let item_obj = {
                item_id: this.itemSelected._id,
                auths: this.itemSelected.auths,
                item_name: this.itemSelected.name,
                item_rate: itemRate,
                item_weight: itemWeight,
                item_qty: 1,
                author: this.itemSelected.authorObj,
                publisher: this.itemSelected.publisherObj
            }
            let exist_item = this.selectedItems.find(itm => { return itm.item_id == item_obj.item_id });

            if (exist_item) {
                this.selectedItems.map(itm => {
                    if (itm.item_id == item_obj.item_id) {
                        itm.item_qty += 1;
                        return itm;
                    } else {
                        return itm;
                    }
                })
            } else {
                this.selectedItems.push(item_obj);
            }


            this.updateTotalCost();
            this.itemSelected = {}
        } else {
            setTimeout(() => {
                this.itemSelected = {}
            }, 2000)
        }
    }

    getItemByUrl() {
        let surl = this.seo_url ? this.seo_url.trim() : undefined;
        if (surl && surl != '') {
            this._purchaseAcceptService.getItemByUrl(this.seo_url).subscribe(result => {
                if (result && result.product && result.product.length > 0) {
                    this.itemSelected = result.product[0];
                    let item_obj = {
                        item_id: this.itemSelected._id,
                        auths: this.itemSelected.auths,
                        item_name: this.itemSelected.name,
                        item_rate: this.itemSelected.price,
                        item_qty: 1,
                        author: this.itemSelected.authorObj,
                        publisher: this.itemSelected.publisherObj
                    }
                    let exist_item = this.selectedItems.find(itm => { return itm.item_id == item_obj.item_id });
                    if (exist_item) {
                        this.selectedItems.map(itm => {
                            if (itm.item_id == item_obj.item_id) {
                                itm.item_qty += 1;
                                return itm;
                            } else {
                                return itm;
                            }
                        })
                    } else {
                        this.selectedItems.push(item_obj);
                    }
                    this.updateTotalCost();
                    this.itemSelected = {};
                    this.seo_url = undefined;
                } else {
                    this.alerts.push({
                        type: 'danger',
                        msg: "No product found with this url.",
                        timeout: 2000
                    });
                }
            })
        }
    }

    updateTotalCost() {
        this.total_cost = 0;
        this.total_book = 0;
        this.selectedItems.map(itm => {
            this.total_book += itm.item_qty;
            this.total_cost += (itm.item_qty * itm.item_rate)
        })
    }

    edit(itm, indx) {
        itm.is_edit = true;
    }

    edited(itm, indx) {
        this.check_negative_input = false;

        if (itm.item_qty < 0 || itm.item_rate < 0) {
            this.check_negative_input = true;
        }

        if (!this.check_negative_input) {
            itm.is_edit = false;
            this._purchaseAcceptService.updateProductPurchaseHistory(itm).subscribe(result => {

            })
        } else {
            alert("Negative Input Found")
        }


    }

    remove(itm, indx) {
        this.selectedItems.splice(indx, 1);
        this.updateTotalCost();
    }

    purchase() {
        this.check_negative_input = false;

        let invalid_purchase_item = this.selectedItems.find(item => {
            return !item.supplier || item.rate < 1 || item.quantity < 1;
        })
        if (invalid_purchase_item) {
            this.alerts.push({
                type: 'danger',
                msg: "Item list contain invalid quantity, rate or supplier.",
                timeout: 5000
            });
        } else {
            this.accept.items = this.selectedItems.map(item => {
                if (item.item_qty < 0 || item.item_rate < 0) {
                    this.check_negative_input = true;
                }
                return {
                    authors_id: item.auths,
                    price: (item.item_qty * item.item_rate),
                    product_id: item.item_id,
                    product_name: item.item_name,
                    publisher_id: item.publisher._id,
                    publisher: item.publisher.name,
                    quantity: item.item_qty,
                    rate: item.item_rate,
                    supplier: item.supplier._id,
                    supplier_name: item.supplier.name
                }
            })
            this.accept.net_amount = this.total_cost;
            this.accept.total_book = this.total_book;
            this.accept.convenience = this.accept.convenience && this.accept.convenience != '' ? this.accept.convenience : 0;
            this.accept.courier_charge = this.accept.courier_charge && this.accept.courier_charge != '' ? this.accept.courier_charge : 0;
            this.accept.purchase_cost = (this.accept.net_amount + this.accept.convenience + this.accept.courier_charge)
            this.final_purchase_items = this.accept.items;

            if (!this.check_negative_input) {
                this.res_pending = true;
                this._purchaseAcceptService.add(this.accept).subscribe(result => {
                    this.res_pending = false;
                    if (result._id) {
                        this.accept.purchase_no = result.purchase_no;
                        this.selectedItems = [];
                        this.purchaseInfo = result;
                        this.invoiceModal.show();
                    } else {
                        this.alerts.push({
                            type: 'danger',
                            msg: result.message,
                            timeout: 4000
                        });
                    }
                })
            } else {
                alert("Negative input found");
            }

        }
    }

    print(): void {
        let printContents, popupWin;
        printContents = document.getElementById('print-section').innerHTML;
        popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
        popupWin.document.open();
        popupWin.document.write(`
      <html>
        <head>
          <title>Print tab</title>
          <style>
             @media print
                {
                     table{ width:100%;}
                    .table-print{width:100%;}
                }
            table{ width:100%;}
            .tbl-data td{border-bottom:0.5px dotted #ccc;}
            .table-headr td{font-size:8px;}   
          </style>
        </head>
        <body onload="window.print();window.close()">${printContents}</body>
      </html>`
        );
        popupWin.document.close();
        this.invoiceModal.hide();
    }


}