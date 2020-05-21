import { Component, ViewEncapsulation, ViewChild } from "@angular/core";
import { Location } from "@angular/common";
import { ModalDirective } from 'ng2-bootstrap';
import { Subject } from 'rxjs/Subject';

import 'style-loader!./create-purchase-requisition.scss';
import { PurchaseRequisitionCreateService } from "./create-purchase-requisition.service";

@Component({
    selector: 'purchase-order-create',
    templateUrl: './create-purchase-requisition.html'
})
export class PurchaseRequisitionCreateComponent {

    @ViewChild('orderCreateModal') orderCreateModal: ModalDirective;
    public orders: any = [];
    public selectedall = false;
    public selected = [];
    public alerts: any = [];
    public selected_items: any = [];
    public summary: number = 0;
    public updateOrder_only: boolean;
    public isClear: boolean;
    public isItemSubmited: boolean;
    public waiting: boolean;

    public emp: any = {};
    public employeeList: any = [];
    public isEmployeeSubmited: boolean;
    public new_employee: any = {};
    public hideNewEmployeeAdd: boolean;
    employeeSearchTerm$ = new Subject<string>();


    constructor(private location: Location, public _purchaseRequisitionCreateService: PurchaseRequisitionCreateService, /*public employeeService: EmployeeService*/) { }

    ngOnInit() {
        this.getNewOrder();
        this._purchaseRequisitionCreateService.getEmployeeSearched(this.employeeSearchTerm$)
            .subscribe(results => {
                this.new_employee.name = this._purchaseRequisitionCreateService.getTerm();
                this.hideNewEmployeeAdd = false;
                this.employeeList = results.employee;
            });
    }

    getNewOrder() {
        this.waiting = true;
        this._purchaseRequisitionCreateService.getOrderByStatus("Confirmed").subscribe((result) => {
            this.waiting = false;
            this.orders = result
        })
    }

    onChangeSelectedAll() {
        this.orders = this.orders.map(order => { order.is_selected = this.selectedall; return order; })
    }

    showItems() {
        this.employeeList = [];
        this.emp = {};
        this.new_employee = {};
        this.hideNewEmployeeAdd = true;
        this.updateOrder_only = false;
        let selectedOrders = this.orders.filter(order => { return order.is_selected });
        if (selectedOrders.length > 0) {
            let ids = selectedOrders.map(slOrder => { return slOrder._id });
            this._purchaseRequisitionCreateService.getSelectedOrderItemsStatus(ids).subscribe(output => {
                if (Array.isArray(output) && output.length > 0) {
                    this.selected_items = output.sort(function (a, b) {
                        var nameA = a.publisher ? a.publisher.name.toUpperCase() : null;
                        var nameB = b.publisher ? b.publisher.name.toUpperCase() : null;
                        if (nameA < nameB) {
                            return -1;
                        }
                        if (nameA > nameB) {
                            return 1;
                        }
                        return 0;
                    });
                    this.orderCreateModal.show();
                } else {
                    this.alerts.push({
                        type: 'danger',
                        msg: 'Purchase order has already been created for your selected orders.',
                        timeout: 4000
                    });
                }
            })
        } else {
            this.alerts.push({
                type: 'danger',
                msg: 'Please select order first.',
                timeout: 4000
            });
        }
    }

    public handler(type: string, $event: ModalDirective) {
        if (type == 'onHidden2') {
            this.location.back();
        }
    }

    onChangeSelectedOne(status) {
        if (status) {
            let hasFalse = this.orders.find(order => { return !order.is_selected });
            if (!hasFalse) {
                this.selectedall = true;
            } else {
                this.selectedall = false;
            }
        } else {
            this.selectedall = false;
        }
    }

    createOrder() {
        if (this.emp.employee && this.emp.employee.length == 24) {
            let total_sl_price = 0;
            let total_book = 0;
            let items = this.selected_items.map(sl_item => {
                total_sl_price += (sl_item.price * sl_item.quantity);
                total_book += sl_item.quantity;
                let selectedItems = {
                    authors_id: sl_item.authors.map(ath => { return ath._id }),
                    purchase_price: sl_item.last_purchase ? sl_item.last_purchase.rate : 0,
                    price: sl_item.price,
                    product_id: sl_item._id,
                    product_name: sl_item.name,
                    orders_id: sl_item.orders_id,
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
                status: { is_in_process: true },
                order_assign_to: this.emp.employee,
                customer_orders: this.orders.filter(ord => { return ord.is_selected }).map(itm => { return itm._id })
            };

            let hasInvalidQty = data.orderd_products.find(prd => { return isNaN(parseInt(prd.quantity)) || prd.quantity < 1 })
            if (hasInvalidQty) {
                this.alerts.push({
                    type: 'danger',
                    msg: 'Order quantity must be minimum 1',
                    timeout: 4000
                });
            } else {
                this._purchaseRequisitionCreateService.add(data).subscribe(result => {
                    if (result.success) {
                        this.getNewOrder();
                        this.selected_items = [];
                        this.selectedall = false;
                        this.orderCreateModal.hide();
                        this.alerts.push({
                            type: 'info',
                            msg: 'Order Created Successfully!',
                            timeout: 4000
                        });
                    } else {
                        this.alerts.push({
                            type: 'danger',
                            msg: 'Internal server error. Try again latter.',
                            timeout: 4000
                        });
                    }
                })
            }
        } else {
            this.alerts.push({
                type: 'danger',
                msg: 'Select an employee to purchase',
                timeout: 4000
            });
        }

    }

    cancel() {
        this.orderCreateModal.hide();
    }

    back() {
        this.location.back();
    }

    remove(index) {
        this.selected_items.splice(index, 1);
        if (this.selected_items.length == 0) {
            this.updateOrder_only = true;
        }
    }

    updateOrdersOnly() {
        let orders_id = this.orders.filter(ord => { return ord.is_selected }).map(itm => { return itm._id });
        this._purchaseRequisitionCreateService.updateOrderOnly({ customer_orders: orders_id }).subscribe(result => {
            if (result.success) {
                this.getNewOrder();
                this.selected_items = [];
                this.selectedall = false;
                this.orderCreateModal.hide();
            }
        })
    }

    getSelectedEmployee(data) {
        this.emp.employee = data._id;
        this.new_employee = data;
    }

    saveNewEmployee() {
        this.isItemSubmited = true;
        this.isEmployeeSubmited = true;
        this.new_employee.is_enabled = true;
        if (this.new_employee.name && this.new_employee.name != '' && this.new_employee.phone && this.new_employee.phone != '' && this.new_employee.employee_id && this.new_employee.employee_id != '' && this.new_employee.email && this.new_employee.email != '') {
            this._purchaseRequisitionCreateService.addEmployee(this.new_employee).subscribe(result => {
                if (result.success) {
                    this.isItemSubmited = false;
                    this.emp.employee = result.data._id;
                    this.isEmployeeSubmited = false;
                    this.new_employee = { is_enabled: true };
                    this.alerts.push({
                        type: 'info',
                        msg: 'New Employee add ',
                        timeout: 4000
                    });
                    setTimeout(() => {
                        this.hideNewEmployeeAdd = true;
                    }, 2000)
                } else {
                    this.alerts.push({
                        type: 'danger',
                        msg: 'Something went wrong. Try Again',
                        timeout: 4000
                    });
                }
            })
        } else {
            this.isEmployeeSubmited = true;
        }
    }
}