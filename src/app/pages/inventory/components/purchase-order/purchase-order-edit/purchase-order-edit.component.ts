import { Component, ViewEncapsulation, ViewChild } from "@angular/core";
import { Location } from "@angular/common";
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs/Subject';

import { ModalDirective } from 'ng2-bootstrap';
import { EmployeeService } from "../../employee/employee.service";

import { PurchaseOrderService } from "../putchase-order.service";

@Component({
    selector: 'purchase-order-edit',
    templateUrl: './purchase-order-edit.html',
    styleUrls:['./purchase-order-edit.scss']
})
export class PurchaseOrderEditComponent {

    @ViewChild('orderCreateModal') orderCreateModal: ModalDirective;

    private order_id: string;
    public order: any = {};
    public cust_orders: any = [];
    public selectedall: boolean;
    public updateOrder_only: boolean;
    public alerts: any = [];
    public selected_items: any = [];
    public summary: number = 0;
    public previous_order_ids = [];
    public isClear: boolean;
    public isItemSubmited: boolean;

    public emp: any = {};
    public employeeList: any = [];
    public isEmployeeSubmited: boolean;
    public new_employee: any = {};
    public hideNewEmployeeAdd: boolean;
    employeeSearchTerm$ = new Subject<string>();
    public isChangeEmployee: boolean;

    constructor(private route: ActivatedRoute, public purchaseOrderService: PurchaseOrderService, private location: Location, private employeeService: EmployeeService) {
        this.order_id = this.route.snapshot.params['id'];
        this.purchaseOrderService.getById(this.order_id).subscribe(output => {
            this.order = output.order;
            this.emp.employee = this.order.order_assign_to._id;
            let pre_cust_orders = output.order.customer_orders.map(ordr => { ordr.is_selected = true; return ordr; });
            this.previous_order_ids = output.order.customer_orders.map(ordr => { return ordr._id });
            this.purchaseOrderService.getOrderByStatus("Pending").subscribe((result) => {
                this.selectedall = result.length < 1;
                pre_cust_orders = pre_cust_orders.concat(result);
                this.cust_orders = pre_cust_orders;
            })
        })
    }

    ngOnInit() {
        this.purchaseOrderService.getEmployeeSearched(this.employeeSearchTerm$)
            .subscribe(results => {
                this.new_employee.name = this.purchaseOrderService.getTerm();
                this.hideNewEmployeeAdd = false;
                this.employeeList = results.employee;
            });
    }


    onChangeSelectedAll() {
        this.cust_orders = this.cust_orders.map(order => { order.is_selected = this.selectedall; return order; })
    }

    onChangeSelectedOne(status) {
        if (status) {
            let hasFalse = this.cust_orders.find(order => { return !order.is_selected });
            if (!hasFalse) {
                this.selectedall = true;
            } else {
                this.selectedall = false;
            }
        } else {
            this.selectedall = false;
        }
    }

    showItems() {
        this.updateOrder_only = false;
        this.hideNewEmployeeAdd = true;
        let selectedOrders = this.cust_orders.filter(order => { return order.is_selected });
        if (selectedOrders.length > 0) {
            let ids = selectedOrders.map(slOrder => { return slOrder._id });
            this.purchaseOrderService.getSelectedOrderItemsStatus(ids).subscribe(output => {
                this.selected_items = output;
                this.orderCreateModal.show();
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
        let orders_id = this.cust_orders.filter(ord => { return ord.is_selected }).map(itm => { return itm._id });
        this.purchaseOrderService.updateOrderOnly({ customer_orders: orders_id }).subscribe(result => {
            if (result.success) {
                this.selected_items = [];
                this.selectedall = false;
                this.orderCreateModal.hide();
            }
        })
    }

    updateOrder() {
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
                    publisher_id: sl_item.publisher._id,
                    quantity: sl_item.quantity,
                    stock_quantity: sl_item.stock_qty,
                    supplier: sl_item.last_purchase && sl_item.last_purchase.supplier ? sl_item.last_purchase.supplier._id : undefined
                }
                return selectedItems;
            })
            let data = {
                _id: this.order_id,
                total_book: total_book,
                orderd_products: items,
                total_sell_price: total_sl_price,
                status: { is_in_process: true },
                order_assign_to: this.emp.employee,
                customer_orders: this.cust_orders.filter(ord => { return ord.is_selected }).map(itm => { return itm._id }),
                removed_cus_orders: [],
            };
            data.removed_cus_orders = this.previous_order_ids.filter(ord => {
                return data.customer_orders.indexOf(ord) == -1;
            })
            this.purchaseOrderService.update(data).subscribe(result => {
                if (result.success) {
                    this.alerts.push({
                        type: 'info',
                        msg: "Order updated!",
                        timeout: 3000
                    });
                    setTimeout(() => {
                        this.selected_items = [];
                        this.selectedall = false;
                        this.orderCreateModal.hide();
                        this.location.back();
                    }, 2000);
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
                msg: 'Select an employee to purchase',
                timeout: 4000
            });
        }

    }

    getSelectedEmployee(data) {
        this.emp.employee = data._id;
        this.new_employee = data;
    }

    saveNewEmployee() {
        this.isEmployeeSubmited = true;
        this.isItemSubmited = true;
        this.new_employee.is_enabled = true;
        if (this.new_employee.name && this.new_employee.name != '' && this.new_employee.phone && this.new_employee.phone != '' && this.new_employee.employee_id && this.new_employee.employee_id != '' && this.new_employee.email && this.new_employee.email != '') {
            this.employeeService.add(this.new_employee).subscribe(result => {
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

    showSearchEmaployee() {
        this.isChangeEmployee = true;
    }
}