import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from "@angular/common";
import { OrderEditService } from './order-edit.service';
import { OrderCreateService } from '../order-create/order-create.service';

import 'style-loader!./order-edit.scss';
import { Subject } from 'rxjs';

@Component({
    selector: 'order-eidt',
    templateUrl: './order-edit.html',
})
export class OrderEditComponent {

    apiBaseUrl: string = '';
    order_id: string;
    public order: any = {};
    public alerts = [];
    // product
    searchProduct$ = new Subject<string>();
    dataList: Array<any> = [];
    show_image: boolean = true;
    public selectedItems: any = [];
    public InitialItems: any = [];
    public afterDisputeChanges: any = [];
    public itemSelected: any = {};
    public total_cost: number = 0;
    public isClear: boolean = false;
    public shipping_charge: number = 30;

    //address property
    public districts: any = [];
    public thanas: any = [];
    shipping: any = { contact_name: "" };
    public addresses: any = [];
    public hasAddress: boolean;
	public current_user: any = {};

    toggle: boolean = false;


    constructor(private location: Location, private orderEditService: OrderEditService, private orderCreateService: OrderCreateService, private route: ActivatedRoute, private router: Router) { }


    ngOnInit() {
		this.current_user = JSON.parse(window.localStorage.getItem('user'));

        this.apiBaseUrl = this.orderEditService.apiBaseUrl;
        this.order_id = this.route.snapshot.params['id'];
        this.orderEditService.getById(this.order_id).subscribe((order) => {
            this.order = order;
            if(["Inshipment", "Dispatch", "Delivered", "OrderClosed"].indexOf(this.order.current_order_status.status_name) != -1){
                this.toggle = true;
            }
            this.shipping = this.order.delivery_address;
            this.orderCreateService.getDistrict().subscribe(districts => {
                this.districts = districts;
                let dist_id = this.districts.find(dst => { return dst.DISTRICTT_NAME == this.shipping.district }).DISTRICT_NO;
                this.orderCreateService.getThana(dist_id).subscribe(thanas => {
                    this.thanas = thanas;
                })
            })

            this.selectedItems = order.products.map(prd => {
                prd.author = prd.authors[0].name;
                prd.publisher = prd.publisher.name;
                return prd;
            });
            this.updateTotalCost();
        })

        this.orderCreateService.getProductSearched(this.searchProduct$)
            .subscribe(result => {
                this.dataList = result
            });
    }

    selectDistrict() {
        let dist_id = this.districts.find(dst => { return dst.DISTRICTT_NAME == this.shipping.district }).DISTRICT_NO;
        this.orderCreateService.getThana(dist_id).subscribe(thanas => {
            this.thanas = thanas;
        })
    }

    //Product
    getSelected(data) {
        this.itemSelected = data;
    }

    addItemToList() {
        if (this.itemSelected && this.itemSelected._id) {
            this.isClear = true;
            setTimeout(() => {
                this.isClear = false;
            }, 100)
            let item_obj = {
                _id: this.itemSelected._id,
                name: this.itemSelected.name,
                image: this.itemSelected.image,
                price: this.itemSelected.price,
                quantity: 1,
                author: this.itemSelected.authorObj.name,
                publisher: this.itemSelected.publisherObj.name
            }
            let exist_item = this.selectedItems.find(itm => { return itm._id == item_obj._id });
            if (exist_item) {
                this.selectedItems.map(itm => {
                    if (itm._id == item_obj._id) {
                        itm.quantity += 1;
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

    updateTotalCost() {
        this.total_cost = 0;
        this.selectedItems.map(itm => {
            this.total_cost += (itm.quantity * itm.price)
        })
    }

    edit(itm, indx) {
        itm.is_edit = true;
    }

    edited(itm, indx) {

     

        if (((this.order.current_order_status.status_name == 'Dispatch' || this.order.current_order_status.status_name == 'Inshipment' || this.order.current_order_status.status_name == 'Delivered' || this.order.current_order_status.status_name == 'OrderClosed') && this.current_user.role=='Development') ? true : false) {
            this.orderEditService.getById(this.order_id).subscribe((order1) => {
                this.InitialItems = order1.products;
                console.log(this.InitialItems)
                for (var i = 0; i < this.InitialItems.length; i++) {
                    if (this.InitialItems[i]._id == itm._id) {
                        if (this.InitialItems[i].quantity < itm.quantity) {
                            let changedObjectIncrease = {
                                product_info: itm.product_id,
                                previous_qty: this.InitialItems[i].quantity,
                                new_qty: itm.quantity
                            }

                            if (this.afterDisputeChanges.length > 0) {
                                for (let j = 0; j < this.afterDisputeChanges.length; j++) {
                                    if (this.afterDisputeChanges[j].product_info._id == itm._id) {
                                        this.afterDisputeChanges[j].new_qty = itm.quantity;
                                    } else {
                                        this.afterDisputeChanges.push(changedObjectIncrease);
                                    }
                                }
                            } else {
                                this.afterDisputeChanges.push(changedObjectIncrease);
                            }
                        } else if (this.InitialItems[i].quantity > itm.quantity) {
                            let changedObjectReduce = {
                                product_info: itm.product_id,
                                previous_qty: this.InitialItems[i].quantity,
                                new_qty: itm.quantity
                            }

                            if (this.afterDisputeChanges.length > 0) {
                                for (let j = 0; j < this.afterDisputeChanges.length; j++) {
                                    if (this.afterDisputeChanges[j].product_info._id == itm._id) {
                                        this.afterDisputeChanges[j].new_qty = itm.quantity;
                                    } else {
                                        this.afterDisputeChanges.push(changedObjectReduce);
                                    }
                                }
                            } else {
                                this.afterDisputeChanges.push(changedObjectReduce);
                            }

                        } else {
                            for (let j = 0; j < this.afterDisputeChanges.length; j++) {
                                if (this.afterDisputeChanges[j].product_info._id == itm._id) {
                                    this.afterDisputeChanges.splice(j, 1);
                                }
                            }
                        }
                    }
                } 
                console.log(this.afterDisputeChanges)

            })
        }




         itm.is_edit = false;
         this.updateTotalCost();

    }

    remove(itm, indx) {
        itm.quantity = 0

        if (((this.order.current_order_status.status_name == 'Dispatch' || this.order.current_order_status.status_name == 'Inshipment' || this.order.current_order_status.status_name == 'Delivered' || this.order.current_order_status.status_name == 'OrderClosed') && this.current_user.role=='Development') ? true : false) {

            this.orderEditService.getById(this.order_id).subscribe((order1) => {
                this.InitialItems = order1.products;
                //console.log(this.InitialItems)
                for (var i = 0; i < this.InitialItems.length; i++) {
                    if (this.InitialItems[i]._id == itm._id) {
                        if (this.InitialItems[i].quantity < itm.quantity) {
                            let changedObject = {
                                product_info: itm.product_id,
                                previous_qty: this.InitialItems[i].quantity,
                                new_qty: itm.quantity
                            }

                            if (this.afterDisputeChanges.length > 0) {
                                for (let j = 0; j < this.afterDisputeChanges.length; j++) {
                                    if (this.afterDisputeChanges[j].product_info._id == itm._id) {
                                        this.afterDisputeChanges[j].new_qty = itm.quantity;
                                    } else {
                                        this.afterDisputeChanges.push(changedObject);
                                    }
                                }
                            } else {
                                this.afterDisputeChanges.push(changedObject);
                            }
                        }
                    } else if (this.InitialItems[i].quantity > itm.quantity) {
                        let changedObjectReduce = {
                            product_info: itm.product_id,
                            previous_qty: this.InitialItems[i].quantity,
                            new_qty: itm.quantity
                        }

                        if (this.afterDisputeChanges.length > 0) {
                            for (let j = 0; j < this.afterDisputeChanges.length; j++) {
                                if (this.afterDisputeChanges[j].product_info._id == itm._id) {
                                    this.afterDisputeChanges[j].new_qty = itm.quantity;
                                } else {
                                    this.afterDisputeChanges.push(changedObjectReduce);
                                }
                            }
                        } else {
                            this.afterDisputeChanges.push(changedObjectReduce);
                        }

                    } else {
                        for (let j = 0; j < this.afterDisputeChanges.length; j++) {
                            if (this.afterDisputeChanges[j].product_info._id == itm._id) {
                                this.afterDisputeChanges.splice(j, 1);
                            }
                        }
                    }
                }
            })
        }


        this.selectedItems.splice(indx, 1);
        this.updateTotalCost();
    }


    submitOrder() {
        let isItemNotvalid = this.selectedItems.find(itm => {
            return itm.quantity < 1;
        })
        if (!isItemNotvalid) {
            let total_book = 0;
            this.order.products = this.selectedItems.map(item => {
                total_book += item.quantity;
                return {
                    product_id: item._id,
                    name: item.name,
                    image: item.image,
                    quantity: item.quantity,
                    price: item.price,
                    author: item.author,
                    publisher: item.publisher
                }
            });
            this.order.total_price = this.total_cost;
            this.order.total_book = total_book;
            this.order.wrapping_charge = this.order.wrapping_charge ? this.order.wrapping_charge : 0;
            this.order.delivery_charge = this.order.delivery_charge ? this.order.delivery_charge : 0;
            this.order.discount = this.order.discount ? this.order.discount : 0;
            this.order.payable_amount = (this.total_cost + this.order.wrapping_charge + this.order.delivery_charge - this.order.discount);
            this.order.delivery_address = this.shipping;
            this.order.dispute_changes = this.afterDisputeChanges;
            this.orderEditService.updateOrder(this.order).subscribe((result) => {
                if (result.success) {
                    this.alerts.push({
                        type: 'info',
                        msg: "Order Updated Successfully",
                        timeout: 2000
                    });
                    setTimeout(() => {
                        this.location.back();
                    }, 1500)
                } else {
                    this.alerts.push({
                        type: 'danger',
                        msg: result.meaasge,
                        timeout: 4000
                    });
                }
            })
        } else {
            this.alerts.push({
                type: 'danger',
                msg: "Invalid quantity found in item list.",
                timeout: 4000
            });
        }
    }

}