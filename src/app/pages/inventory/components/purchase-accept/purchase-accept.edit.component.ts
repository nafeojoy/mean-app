import { Component, ViewEncapsulation, ViewChild } from "@angular/core";
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Subject } from 'rxjs/Subject';
import { ModalDirective } from 'ng2-bootstrap';

import { InventoryStore } from '../../inventory.store';
import { PurchaseAcceptService } from "./purchase-accept.service";
import { SupplierService } from '../supplier';

import 'style-loader!./purchase-accept.scss';

@Component({
    selector: 'purchase-accept-edit',
    templateUrl: './purchase-accept.edit.html',
})
export class PurchaseAcceptEditComponent extends InventoryStore {

    public accept: any = {};
    public itemList: any = [];
    public selectedMaterials: any = [];
    public purchase_id: string;
    public summary: number = 0;

    public alerts: any = [];
    public previousItems: any = [];
    public purchase_date;
    public isSubmitted: boolean;

    public isClear: boolean = false;
    dataList: Array<any> = [];
    show_image: boolean = true;
    private selected_items_id: any = [];
    public itemSelected: any;
    public pur_item: any = {};
    public supplierList: any = [];
    public isSupplierSubmited: boolean;
    public new_supplier: any = {};
    public hideNewSupplierAdd: boolean;

    itemSearchTerm$ = new Subject<string>();
    supplierSearchTerm$ = new Subject<string>();
    new_pruchase_item: any = {};
    isItemSubmited: boolean;
    isFinishItemAdd: boolean;

    total_book: number = 0;
    purchaseDate: Date;
    public res_pending: boolean;


    @ViewChild('invoiceModal') invoiceModal: ModalDirective;
    @ViewChild('addItemModal') addItemModal: ModalDirective;
    @ViewChild('changeSupplierModal') changeSupplierModal: ModalDirective;



    constructor(private _supplierService: SupplierService, public acceptService: PurchaseAcceptService, private route: ActivatedRoute, private location: Location) {
        super();
        this.acceptService.getItemSearched(this.itemSearchTerm$)
            .subscribe(results => {
                this.dataList = results.product;
            });

        this.acceptService.getSupplierSearched(this.supplierSearchTerm$)
            .subscribe(results => {
                this.supplierList = results.supplier;
            });
    }

    ngOnInit() {
        this.purchase_id = this.route.snapshot.params['id'];
        let result: any = JSON.parse(window.localStorage.getItem(this.purchase_id));

        this.purchaseDate = result.updated_at;

        this.accept.remark = result.remark;
        this.accept.courier_charge = result.courier_charge ? result.courier_charge : 0;
        this.accept.convenience = result.convenience ? result.convenience : 0;
        this.accept.net_amount = result.net_amount ? result.net_amount : 0;
        this.accept.purchase_mode = result.purchase_mode;
        this.accept.customer_orders = result.customer_orders;

        this.previousItems = result.products.map(itm => {
            let newObj = {
                author: itm.authors_id[0].name,
                authors_id: itm.authors_id.map(ath => { return ath._id }),
                price: (itm.rate * itm.quantity),
                product_id: itm.product_id,
                product_name: itm.product_name,
                publisher: itm.publisher_id.name,
                publisher_id: itm.publisher_id._id,
                quantity: itm.quantity,
                rate: itm.rate,
                supplier: itm.supplier && itm.supplier._id ? itm.supplier._id : undefined,
                supplier_name: itm.supplier && itm.supplier.name ? itm.supplier.name : undefined,
            }
            this.summary += newObj.price;
            return newObj;
        });
    }


    updatePurchase(dateBox: Date) {
        this.isSubmitted = true;
        if (this.previousItems.length > 0) {
            this.isSubmitted = false;
            let invalidItems = this.previousItems.filter(itms => {
                return !itms.supplier || itms.rate < 1 || itms.quantity < 1;
            })
            if (invalidItems.length == 0) {
                this.saveNow(this.previousItems, dateBox);
            } else {
                this.alerts.push({
                    type: 'danger',
                    msg: 'Ensure first purchase products must contain Supplier, Quantity and Rate!',
                    timeout: 5000
                });
            }
        }
    }

    saveNow(items, dateBox) {
        this.accept.updated_at = dateBox;
        this.accept.items = items;
        this.accept.total_book = this.total_book;
        this.accept._id = this.purchase_id;
        this.accept.net_amount = this.summary;
        this.accept.purchase_cost = (this.accept.net_amount + this.accept.courier_charge + this.accept.convenience);
        this.res_pending = true;
        this.acceptService.update(this.accept).subscribe(result => {
            if (result._id) {
                this.accept = {};
                setTimeout(() => {
                    this.res_pending = false;
                    this.location.back();
                }, 2000);
                this.alerts.push({
                    type: 'info',
                    msg: 'Purchase updated successfully',
                    timeout: 4000
                });
            }else{
                this.res_pending = false;
                this.alerts.push({
                    type: 'danger',
                    msg: 'Purchase update failed.',
                    timeout: 4000
                }); 
            }
        })
    }

    getDate(event) {
        this.purchase_date = event.dt;
    }

    cancel() {
        this.invoiceModal.hide();
        this.location.back();
    }

    getItems(items) {
        this.selectedMaterials = items;
    }

    searchItem(text) {
        this.acceptService.getSearched(text).subscribe((result) => {
            this.itemList = result.product;
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
          <title>Print tab</title>
          <style>
          
          </style>
        </head>
        <body onload="window.print();window.close()">${printContents}</body>
      </html>`
        );
        popupWin.document.close();
        this.invoiceModal.hide();
        this.location.back();
    }

    back() {
        this.location.back();
    }

    public handler(type: string, $event: ModalDirective) {
        if (type == 'onHidden2') {
            this.location.back();
        }
    }

    getSelectedItem(data) {
        this.pur_item.name = data.name;
        this.new_pruchase_item = {
            product_id: data._id,
            product_name: data.name,
            authors_id: data.auths,
            publisher_id: data.publ,
            author: data.authorObj.name,
            publisher: data.publisherObj.name
        }
    }

    getSelectedSupplier(data) {
        this.pur_item.supplier = data._id;
        this.new_supplier = data;
    }

    show() {
        this.isFinishItemAdd = false;
        this.addItemModal.show();
    }

    public addHandler(type: string, $event: ModalDirective) {
        if (type == 'onHidden2') {
            this.addItemModal.hide();
            this.isFinishItemAdd = true;
        }
    }

    cancelAdd() {
        this.addItemModal.hide();
        this.previousItems = [];
    }

    saveNewSupplier() {
        this.isSupplierSubmited = true;
        this.new_supplier.name = this.acceptService.getTerm();
        if (this.new_supplier.name.length > 0 && this.new_supplier.address && this.new_supplier.address.length > 0) {
            this._supplierService.add(this.new_supplier).subscribe(output => {
                if (output.success) {
                    this.new_supplier = output.data;
                    this.isSupplierSubmited = false;
                    this.hideNewSupplierAdd = true;
                }
            })
        }
    }

    addItem() {
        this.isItemSubmited = true;
        this.new_pruchase_item.supplier = this.new_supplier._id;
        this.new_pruchase_item.supplier_name = this.new_supplier.name;
        this.new_pruchase_item.rate = this.pur_item.rate;
        this.new_pruchase_item.quantity = this.pur_item.quantity;
        this.new_pruchase_item.price = this.pur_item.quantity * this.pur_item.rate;
        let itm = this.new_pruchase_item;
        if (itm.product_id && itm.rate > 0 && itm.quantity > 0 && itm.supplier) {
            this.isClear = true;
            setTimeout(() => {
                this.isClear = false;
            }, 500);
            this.previousItems.push(itm);
            this.isItemSubmited = false;
            this.pur_item = {}
            this.new_pruchase_item = {};
            this.getCost();
        }
    }

    remove(index) {
        this.previousItems.splice(index, 1);
        this.getCost();
    }

    finishAdd() {
        this.addItemModal.hide();
        this.isFinishItemAdd = true;
    }

    getCost() {
        this.summary = 0;
        this.total_book = 0;
        this.previousItems.map(itm => {
            this.total_book += itm.quantity;
            itm.price = itm.quantity * itm.rate;
            this.summary += (itm.quantity * itm.rate);
        })
    }

    changeItemvalue() {
        this.getCost();
    }

    new_supp_item_index: number;
    addSupp(item, index) {
        this.new_supp_item_index = index;
        this.changeSupplierModal.show();
    }

    closeSuppModal() {
        this.changeSupplierModal.hide();
    }

    changeSupp() {
        if (this.new_supplier._id) {
            this.previousItems[this.new_supp_item_index].supplier = this.new_supplier._id;
            this.previousItems[this.new_supp_item_index].supplier_name = this.new_supplier.name;
            this.changeSupplierModal.hide();
            this.new_supplier = {};
            this.isClear = true;
            setTimeout(() => {
                this.isClear = false;
            }, 500);
        }
    }


}