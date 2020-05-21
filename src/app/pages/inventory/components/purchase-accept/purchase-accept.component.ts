import { Component, ViewEncapsulation, ViewChild } from "@angular/core";
import { Subject } from 'rxjs/Subject';

import { Location } from "@angular/common";
import { PurchaseAcceptService } from "./purchase-accept.service";
import { PurchaseOrderService } from "../purchase-order";
import { SupplierService } from '../supplier';
import { InventoryStore } from '../../inventory.store';
import { ModalDirective } from 'ng2-bootstrap';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'purchase-accept-add',
    templateUrl: './purchase-accept.html',
    styleUrls: ['./purchase-accept.scss']
})
export class PurchaseAcceptComponent extends InventoryStore {

    public accept: any = { convenience: 0, courier_charge: 0, purchase_mode: 'Cash' };
    public itemList: any = [];
    public selectedMaterials: any = [];
    public alerts: any = [];
    public purchaseInfo: any = {};
    public supplier_info: any = {};
    public summary: number = 0;
    public purchase_date = new Date();
    public isSubmitted: boolean;
    public showItemAdd: boolean;


    //Add Items
    public isClear: boolean = false;
    show_image: boolean = true;
    public pur_item: any = {};
    public supplierList: any = [];
    public isSupplierSubmited: boolean;
    public new_supplier: any = {};
    public hideNewSupplierAdd: boolean;

    supplierSearchTerm$ = new Subject<string>();
    new_pruchase_item: any = {};
    new_pruchase_items: any = [];
    final_purchase_items: any = [];
    original_requisition_items: any = [];
    total_book: number = 0;
    isItemSubmited: boolean;
    isFinishItemAdd: boolean;
    public res_pending: boolean;
    check_negative_input: boolean = false;


    @ViewChild('invoiceModal') invoiceModal: ModalDirective;
    @ViewChild('addItemModal') addItemModal: ModalDirective;
    @ViewChild('changeSupplierModal') changeSupplierModal: ModalDirective;
    @ViewChild('actionModal') actionModal: ModalDirective;

    //For Purchase info
    status: any = {};
    selected_item_for_pi: any = {};

    constructor(
        public acceptService: PurchaseAcceptService,
        private _supplierService: SupplierService,
        private _purchaseOrderService: PurchaseOrderService,
        private location: Location,
        private route: ActivatedRoute
    ) {
        super();
        this.acceptService.getSupplierSearched(this.supplierSearchTerm$)
            .subscribe(results => {
                this.supplierList = results.supplier;
            });

    }

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            if (params.order_no) {
                this.getPurOrder(params.order_no);
                this.accept.voucher_no = params.order_no;
            }
        })
    }

    getPurOrder(value) {
        this._purchaseOrderService.get(value).subscribe(result => {
            if (result.found) {
                this.isFinishItemAdd = true;
                this.original_requisition_items = result.order.orderd_products;
                this.new_pruchase_items = result.order.orderd_products.map(itm => {
                    let newObj = {
                        author: itm.authors_id[0].name,
                        authors_id: itm.authors_id.map(ath => { return ath._id }),
                        price: (itm.purchase_price * itm.quantity),
                        product_id: itm.product_id._id,
                        product_name: itm.product_name,
                        publisher: itm.publisher_id.name,
                        publisher_id: itm.publisher_id._id,
                        quantity: itm.pur_quantity >= itm.quantity ? 0 : itm.quantity - itm.pur_quantity,
                        pur_quantity: 0,
                        already_purchased: itm.pur_quantity ? itm.pur_quantity : 0,
                        is_already_purchased: itm.pur_quantity >= itm.quantity,
                        rate: itm.purchase_price,
                        weight: (itm && itm.product_id && itm.product_id.purchase_history != undefined) ? itm.product_id.purchase_history.weight : undefined,
                        supplier: itm.supplier && itm.supplier._id ? itm.supplier._id : undefined,
                        supplier_name: itm.supplier && itm.supplier.name ? itm.supplier.name : undefined,
                    }
                    return newObj;
                });

                this.getCost();
            } else {
                this.alerts.push({
                    type: 'danger',
                    msg: result.message,
                    timeout: 4000
                });
            }
        })
    }

    acceptPurchase() {
        this.check_negative_input = false;

        this.isSubmitted = true;
        this.final_purchase_items = this.new_pruchase_items.filter(itm => {
            if (itm.supplier && itm.rate > 0 && itm.pur_quantity > 0) {
                return itm;
            };
        });

    

        if (this.final_purchase_items.length > 0) {
            this.summary = 0;
            this.total_book = 0;
            this.isSubmitted = false;
            this.final_purchase_items = this.final_purchase_items.map(itm => {
                if (itm.item_qty < 0 || itm.item_rate < 0) {
                    this.check_negative_input = true;
                }
                itm.quantity = itm.pur_quantity;
                itm.weight = itm.weight;
                this.total_book += itm.pur_quantity;
                itm.price = itm.pur_quantity * itm.rate;
                this.summary += (itm.pur_quantity * itm.rate);
                return itm;
            })

            if(!this.check_negative_input){
                this.saveNow(this.final_purchase_items);
            } else {
                alert("Negative input found");
            }
        } else {
            this.alerts.push({
                type: 'danger',
                msg: 'No item found to purchase!',
                timeout: 5000
            });
            alert('No item found to purchase!');

        }
    }

    saveNow(items) {


        this.accept.items = items;
        this.accept.net_amount = this.summary;
        this.accept.total_book = this.total_book;


        this.accept.convenience = this.accept.convenience && this.accept.convenience != '' ? this.accept.convenience : 0;
        this.accept.courier_charge = this.accept.courier_charge && this.accept.courier_charge != '' ? this.accept.courier_charge : 0;
        this.accept.purchase_cost = (this.accept.net_amount + this.accept.convenience + this.accept.courier_charge);
        this.accept.updated_purchase_order_item = this.original_requisition_items.map(itm => {
            itm.authors_id = itm.authors_id.map(ath => { return ath._id });
            itm.publisher_id = itm.publisher_id._id;
            itm.supplier = itm.supplier ? itm.supplier._id : null;

            let nItm = items.find(nitm => { return nitm.product_id == itm.product_id._id });
            if (nItm) {
                itm.pur_quantity = nItm.already_purchased + nItm.pur_quantity;
            }
            return itm;
        })
        this.accept.is_partialy_processed = (this.accept.updated_purchase_order_item.find(itm => itm.pur_quantity < itm.quantity) ? true : false);
        this.accept.is_completed = !this.accept.is_partialy_processed;
        this.accept.is_in_process = !this.accept.is_completed;
        this.res_pending = true;

        this.acceptService.add(this.accept).subscribe(result => {
            this.res_pending = false;

            if (result._id) {
                this.selectedMaterials = [];
                this.purchaseInfo = result;
                this.invoiceModal.show();
            } else {
                this.alerts.push({
                    type: 'danger',
                    msg: result.message,
                    timeout: 4000
                });
                alert(result.message);
            }
        })
    }
    //***************Purchase Info */
    onActionClick(item) {
        this.selected_item_for_pi = item;
        this.actionModal.show();
    }

    statusChange(status) {
        switch (status) {
            case 'out_of_stock': {
                this.status.is_out_of_stock = true;
                this.status.is_out_of_print = false;
                this.status.is_info_delay = false;
                this.status.comment = `The book is out of stock, will arrive ${this.status.arrives_in_stock ? 'after ' + this.status.arrives_in_stock + ' days.' : '(NOT SURE)'}`;
                break;
            }
            case 'out_of_print': {
                this.status.is_out_of_print = true;
                this.status.is_out_of_stock = false;
                this.status.is_info_delay = false;
                this.status.comment = "The book is out of print.";
                break;
            }
            case 'info_delay': {
                this.status.is_info_delay = true;
                this.status.is_out_of_stock = false;
                this.status.is_out_of_print = false;
                this.status.comment = `Not sure about availivility of this book, can be ${this.status.info_delayed ? 'after ' + this.status.info_delayed + ' days.' : '(NOT SURE)'}`;
                break;
            }
        }

    }

    submitPrInfo() {
        let data: any = new Object();
        Object.keys(this.status).forEach(key => {
            if (this.status[key])
                data[key] = this.status[key]
        })
        if (Object.keys(data).length > 1) {
            data.product_id = this.selected_item_for_pi.product_id
        }
        this.status.comment = this.status.comment ? this.status.comment.trim() : this.status.comment;
        if (this.status.comment && this.status.comment != '' && this.status.comment.length > 3) {
            this._purchaseOrderService.saveStatus(data).subscribe(output => {
                if (output.success) {
                    this.actionModal.hide();
                    this.alerts.push({
                        type: 'info',
                        msg: "Status updated successfully.",
                        timeout: 4000
                    });
                } else {
                    alert("Failed,Internal server erorr. Try again latter.")
                }
            })
        } else {
            alert("Invalid comment.")
        }
    }

    //======================================

    cancel() {
        this.invoiceModal.hide();
        this.location.back();
    }

    getItems(items) {
        this.selectedMaterials = items;
    }

    getDate(event) {
        this.purchase_date = event.dt;
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
        this.new_pruchase_items = [];
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

    remove(index) {
        this.new_pruchase_items.splice(index, 1);
        this.getCost();
    }

    finishAdd() {
        this.addItemModal.hide();
        this.isFinishItemAdd = true;
    }

    getCost() {
        this.summary = 0;
        this.total_book = 0;
        this.new_pruchase_items.map(itm => {
            this.total_book += itm.pur_quantity;
            itm.price = itm.pur_quantity * itm.rate;
            this.summary += (itm.pur_quantity * itm.rate);
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
            this.new_pruchase_items[this.new_supp_item_index].supplier = this.new_supplier._id;
            this.new_pruchase_items[this.new_supp_item_index].supplier_name = this.new_supplier.name;
            this.changeSupplierModal.hide();
            this.new_supplier = {};
            this.isClear = true;
            setTimeout(() => {
                this.isClear = false;
            }, 500);
        } else {
            this.alerts.push({
                type: 'danger',
                msg: "No supplier found.",
                timeout: 4000
            });
        }
    }

}