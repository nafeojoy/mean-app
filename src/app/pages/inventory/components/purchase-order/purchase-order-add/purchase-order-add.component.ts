import { Component, ViewEncapsulation, ViewChild } from "@angular/core";
import { Location } from "@angular/common";
import { ModalDirective } from 'ng2-bootstrap';
import { Subject } from 'rxjs/Subject';

import { PurchaseOrderService } from "../putchase-order.service";
import { EmployeeService } from "../../employee/employee.service";

@Component({
    selector: 'purchase-order-add',
    templateUrl: './purchase-order-add.html',
    styleUrls: ['./purchase-order-add.scss']
})
export class PurchaseOrderAddComponent {
    alerts: any = [];
    dataList: Array<any> = [];
    show_image: boolean = true;
    searchProduct$ = new Subject<string>();
    public selectedItems: any = [];
    public itemSelected: any = {};
    private selected_items_id: any = [];
    public total_cost: number = 0;
    public isClear: boolean = false;
    seo_url: any;

    //Publisher
    searchPurlisher$ = new Subject<string>();
    publisherDataList: Array<any> = [];
    public isPubClear: boolean = false;
    public selectedPublisher: any = {};
    getting_publisher_book: boolean;

    //Employee
    public emp: any = {};
    public employeeList: any = [];
    public isEmployeeSubmited: boolean;
    public new_employee: any = {};
    public hideNewEmployeeAdd: boolean;
    employeeSearchTerm$ = new Subject<string>();

    public quantity: number = 1;

    constructor(private _purchaseOrderService: PurchaseOrderService) {

    }

    ngOnInit() {
        this._purchaseOrderService.getPublisherSearched(this.searchPurlisher$)
            .subscribe(result => {
                this.publisherDataList = result.publisher
            });

        this._purchaseOrderService.getProductSearched(this.searchProduct$)
            .subscribe(result => {
                this.dataList = result.product
            });

        this._purchaseOrderService.getEmployeeSearched(this.employeeSearchTerm$)
            .subscribe(results => {
                this.new_employee.name = this._purchaseOrderService.getTerm();
                this.hideNewEmployeeAdd = false;
                this.employeeList = results.employee;
            });
    }



    //Publisher
    getPublisherData(text) {
        this._purchaseOrderService.getSearchedPublisher(text).subscribe((result) => {
            this.publisherDataList = result.publisher
        })
    }

    getSelectedPublisher(data) {
        this.selectedPublisher = data;
    }

    getPublisherBook() {
        if (this.selectedPublisher && this.selectedPublisher.name) {
            this.total_cost = 0;
            this.getting_publisher_book = true;
            this._purchaseOrderService.getPublisherBook(this.selectedPublisher.name).subscribe(result => {
                this.getting_publisher_book = false;
                if (result && result.length > 0) {
                    result.map(item => {
                        this.total_cost += ((item.stock_qty >= item.quantity ? 0 : item.quantity) * (item.last_purchase && item.last_purchase.rate ? item.last_purchase.rate : 0));
                        let pur_item = {
                            item_id: item._id,
                            name: item.name,
                            author: item.authors[0] ? item.authors[0].name : '',
                            quantity: item.quantity,
                            stock_qty: item.stock_qty,
                            purchase_qty: item.stock_qty >= item.quantity ? 0 : item.quantity,
                            supplier: item.last_purchase && item.last_purchase.supplier &&
                                item.last_purchase.supplier.name ? item.last_purchase.supplier.name : '',
                            rate: item.last_purchase && item.last_purchase.rate ? item.last_purchase.rate : 0
                        }
                        this.selectedItems.push(pur_item);
                    })
                }
            })
        }
    }
    // ========================

    getSelected(data) {
        this.itemSelected = data;
    }

    addItem() {
        let surl = this.seo_url ? this.seo_url.trim() : undefined;
        if (this.quantity > 0) {
            if (this.itemSelected && this.itemSelected._id) {
                this.addItemToList();
            } else if (surl && surl != '') {
                this.getItemByUrl()
            } else {
                this.alerts.push({
                    type: 'danger',
                    msg: "Select product by searching with name or Seo Url",
                    timeout: 4000
                });
            }
        } else {
            this.alerts.push({
                type: 'danger',
                msg: "Invalid Quantity.",
                timeout: 4000
            });
        }
    }

    addItemToList() {
        this.isClear = true;
        this._purchaseOrderService.getProductStockInfo(this.itemSelected._id).subscribe(result => {
            this.isClear = false;
            if (result && result.length > 0) {
                let itm = result[0];
                this.selected_items_id.push(this.itemSelected._id);
                let item_obj = {
                    item_id: this.itemSelected._id,
                    name: this.itemSelected.name,
                    author: itm.authors[0] ? itm.authors[0].name : '',
                    quantity: 1,
                    stock_qty: itm.stock_qty,
                    purchase_qty: 1,
                    supplier: itm.last_purchase && itm.last_purchase.supplier &&
                        itm.last_purchase.supplier.name ? itm.last_purchase.supplier.name : '',
                    rate: itm.last_purchase && itm.last_purchase.rate ? itm.last_purchase.rate : 0
                }
                this.selectedItems.push(item_obj);
                this.updateTotalCost();
                this.itemSelected = {}
            }
        })
    }

    getItemByUrl() {
        this._purchaseOrderService.getItemByUrl(this.seo_url).subscribe(result => {
            if (result && result.length > 0) {
                let item = result[0];
                let item_obj = {
                    item_id: item._id,
                    name: item.name,
                    author: item.authors[0] ? item.authors[0].name : '',
                    quantity: 1,
                    stock_qty: item.stock_qty,
                    purchase_qty: 1,
                    supplier: item.last_purchase && item.last_purchase.supplier &&
                        item.last_purchase.supplier.name ? item.last_purchase.supplier.name : '',
                    rate: item.last_purchase && item.last_purchase.rate ? item.last_purchase.rate : 0
                }
                this.selectedItems.push(item_obj);
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

    createOrder() {
        if (this.emp.employee && this.emp.employee.length == 24) {
            let total_sl_price = 0;
            let total_book = 0;
            let items = this.selectedItems.map(sl_item => {
                total_sl_price += (sl_item.price * sl_item.quantity);
                total_book += sl_item.quantity;
                let selectedItems = {
                    authors_id: sl_item.authors.map(ath => { return ath._id }),
                    purchase_price: sl_item.last_purchase ? sl_item.last_purchase.rate : 0,
                    price: sl_item.price,
                    product_id: sl_item._id,
                    product_name: sl_item.name,
                    publisher_id: sl_item.publisher._id,
                    quantity: sl_item.quantity,
                    stock_quantity: sl_item.stock_qty,
                    supplier: sl_item.last_purchase && sl_item.last_purchase.supplier ? sl_item.last_purchase.supplier._id : undefined
                }
                return selectedItems;
            })
            let data = {
                total_book: total_book,
                orderd_products: items,
                total_sell_price: total_sl_price,
                status: { is_in_process: false },
                order_assign_to: this.emp.employee,
                customer_orders: []
            };

            let hasInvalidQty = data.orderd_products.find(prd => { return isNaN(parseInt(prd.quantity)) || prd.quantity < 1 })
            if (hasInvalidQty) {
                this.alerts.push({
                    type: 'danger',
                    msg: 'Order quantity must be minimum 1',
                    timeout: 4000
                });
            } else {
                console.log("Perfect");
                console.log(data);
                // this._purchaseRequisitionCreateService.add(data).subscribe(result => {
                //     if (result.success) {
                //         this.getNewOrder();
                //         this.selected_items = [];
                //         this.selectedall = false;
                //         this.orderCreateModal.hide();
                //         this.alerts.push({
                //             type: 'info',
                //             msg: 'Order Created Successfully!',
                //             timeout: 4000
                //         });
                //     }
                // })
            }
        } else {
            this.alerts.push({
                type: 'danger',
                msg: 'Select an employee to purchase',
                timeout: 4000
            });
        }

    }

    getSelectedEmployee(data) {
        this.emp.employee = data._id;
        this.new_employee = data;
    }


    updateTotalCost() {
        this.total_cost = 0;
        this.selectedItems.map(itm => {
            this.total_cost += (itm.purchase_qty * itm.rate)
        })
    }

    edit(itm, indx) {
        itm.is_edit = true;
    }

    edited(itm, indx) {
        itm.is_edit = false;
    }

    remove(itm, indx) {
        this.selectedItems.splice(indx, 1);
        let id_indx = this.selected_items_id.indexOf(itm._id);
        this.selected_items_id.splice(id_indx, 1);
        this.updateTotalCost();
    }
}