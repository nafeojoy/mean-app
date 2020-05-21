import { Component, ViewEncapsulation, ViewChild } from "@angular/core";
import { Location } from "@angular/common";
import { PurchaseOrderService } from "../putchase-order.service";
import 'style-loader!../../../datepick.css';
import { ModalDirective } from 'ng2-bootstrap';
import { Subject } from 'rxjs';
import { InventoryStore } from '../../../inventory.store';

@Component({
    selector: 'pending-book-list',
    templateUrl: './pending-book-list.html',
    styleUrls: ['./pending-book-list.scss']
})
export class PendingBookListComponent extends InventoryStore {

    @ViewChild('changeSupplierModal') changeSupplierModal: ModalDirective;
    @ViewChild('purchaseItemsModal') purchaseItemsModal: ModalDirective;

    loading: boolean;
    products: Array<any> = [];
    query: any = {};
    dtRange: any = {};
    selected_purchase_items: any = {};
    purchase_data: any = { convenience: 0, courier_charge: 0, purchase_mode: 'Cash', purchase_date: new Date() };
    res_pending: boolean;

    supplierSearchTerm$ = new Subject<string>();
    public supplierList: any = [];
    new_supplier: any = {};
    isClear: boolean;
    public alerts: any = [];


    constructor(
        private location: Location,
        private _purchaseOrderService: PurchaseOrderService
    ) { super(); }

    ngOnInit() {
        this.getBooks();
        this._purchaseOrderService.getSupplierSearched(this.supplierSearchTerm$)
            .subscribe(results => {
                this.supplierList = results.supplier;
            });
    }

    getBooks() {
        this.loading = true;
        this._purchaseOrderService.getPendingPurchaseBookList(this.query).subscribe(result => {
            this.loading = false;
            if (result.success) {
                this.products = result.data.map(prod => {
                    prod.orders = prod.order_no.join(', ');
                    prod.purchased_qty = 0;
                    if (prod.supplier && prod.supplier._id) {
                        prod.supplier = { _id: prod.supplier._id, name: prod.supplier.name }
                    }
                    return prod;
                })
                this.dtRange = [new Date(result.date.from), new Date(result.date.to)]
            }
        });
    }

    dateChanged() {
        this.query.from_date = new Date(this.dtRange[0]);
        this.query.to_date = new Date(this.dtRange[1]);
        this.getBooks();
    }

    new_supp_item_index: number;
    addSupp(item, index) {
        this.new_supp_item_index = index;
        this.changeSupplierModal.show();
    }

    getSelectedSupplier(data) {
        this.new_supplier = data;
    }

    changeSupp() {
        if (this.new_supplier._id) {
            this.products[this.new_supp_item_index].supplier = {
                _id: this.new_supplier._id,
                name: this.new_supplier.name
            }
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

    closeSuppModal() {
        this.changeSupplierModal.hide();
    }

    openPurchaseModal() {
        this.selected_purchase_items = this.products.filter(prod => {
            return prod.purchased_qty > 0 && prod.last_pprice > 0 && prod.supplier && prod.supplier.name
        })
        this.purchaseItemsModal.show();
    }

    purchase() {
        alert("This part is under devcelopment.")
        // this.res_pending = true;
        // let total_book = 0;
        // let net_amount = 0;

        // let data = this.purchase_data;
        // data.items = this.selected_purchase_items.map(itm => {
        //     net_amount += (itm.purchased_qty * itm.last_pprice);
        //     total_book += itm.purchased_qty;
        //     return {
        //         authors_id: itm.authors_id,
        //         price: (itm.purchased_qty * itm.last_pprice),
        //         product_id: itm._id,
        //         product_name: itm.book_name,
        //         publisher: itm.publisher,
        //         publisher_id: itm.publisher_id,
        //         quantity: itm.purchased_qty,
        //         rate: itm.last_pprice,
        //         supplier: itm.supplier._id,
        //         supplier_name: itm.supplier.name,
        //         order_id:itm.order_id
        //     }
        // });
        // data.total_book=total_book;
        // data.net_amount=net_amount;
        // data.convenience = data.convenience && data.convenience != '' ? data.convenience : 0;
        // data.courier_charge = data.courier_charge && data.courier_charge != '' ? data.courier_charge : 0;
        // data.purchase_cost = (net_amount + data.convenience + data.courier_charge)

        // this._purchaseOrderService.purchasePendingBook(data).subscribe((result: any) => {
        //     console.log(result);
        //     this.res_pending = false;
        // })
    }
}