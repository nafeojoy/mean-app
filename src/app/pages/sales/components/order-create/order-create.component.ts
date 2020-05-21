import { Component, ViewEncapsulation } from '@angular/core';
import { OrderCreateService } from './order-create.service';
import { TypeaheadFormGroup } from '../../../../shared/interfaces/typeahead-form-group.interface';

import 'style-loader!./order-create.scss';
import { Subject } from 'rxjs';

@Component({
    selector: 'order-create',
    templateUrl: './order-create.html',
})
export class OrderCreateComponent {
    //Subscriber Create property
    public alerts: any = [];
    public registerMessage = "";
    public registerStatus: boolean = false;
    public subscriber: any = {};
    public passowrd_match_error: boolean = false;
    public validation: any = {};
    public customerList: any = [];
    public searchCustomer$ = new Subject<string>();
    public hasSubsCriber: boolean;

    //address create property
    public districts: any = [];
    public thanas: any = [];
    shipping: any = { contact_name: "" };
    public addresses: any = [];
    public hasAddress: boolean;
    //Author Filter
    authorDataList: Array<any> = [];
    public isAuthClear: boolean = false;
    public selectedAuthor: any = {}

    // product
    searchProduct$ = new Subject<string>();
    dataList: Array<any> = [];
    show_image: boolean = true;
    public selectedItems: any = [];
    public itemSelected: any = {};
    private selected_items_id: any = [];
    public total_cost: number = 0;
    public isClear: boolean = false;
    seo_url: any;

    public order: any = { delivery_charge: 40, discount: 0, wrapping_charge: 0, created_from: "Facebook", send_sms: true };
    public order_sources: Array<string> = ["Mail", "Facebook", "Phone", "CallCenter"]
    constructor(private orderCreateService: OrderCreateService) {

    }

    ngOnInit() {
        this.orderCreateService.getDistrict().subscribe(districts => {
            this.districts = districts;
        })

        this.orderCreateService.getProductSearched(this.searchProduct$)
            .subscribe(result => {
                this.dataList = result
            });

        this.orderCreateService.getSearchedSubscriber(this.searchCustomer$)
            .subscribe(result => {
                this.customerList = result.data
            });
    }

    selectedCustomer(data) {
        this.shipping.phone_number = data.phone_number;
        this.shipping.contact_name = data.first_name;
        this.orderCreateService.getShipingAddress(data._id).subscribe(result => {
            if (result.exist) {
                this.shipping.address = result.data ? result.data.address : '';
                this.shipping.district = result.data ? result.data.district : '';
                this.selectDistrict();
                this.shipping.thana = result.data ? result.data.thana : '';
                this.shipping.alter_phone = result.data ? result.data.alter_phone : '';
            } else {
                this.shipping.new_address = true;
            }
        })
    }

    getText(text) {
        if (this.customerList.length == 0) {
            this.shipping.phone_number = text;
            this.shipping.new_customer = true;
            this.shipping.new_address = true;
        }
    }

    selectDistrict() {
        let dist_id = this.districts.find(dst => { return dst.DISTRICTT_NAME == this.shipping.district }).DISTRICT_NO;
        this.orderCreateService.getThana(dist_id).subscribe(thanas => {
            this.thanas = thanas;
        })
    }

    getDistrictName() {
        return this.districts.find(dist => { return dist.DISTRICT_NO == this.shipping.district }).DISTRICTT_NAME;
    }

    //Create Account

    validate(field) {
        if (field != 'email') {
            this.validation[field] = { required_error: false, length_error: false }
            if (!this.subscriber[field] && this.subscriber[field] != "") {
                this.validation[field].required_error = true;
            } else {
                if (this.subscriber[field].length < 4) {
                    this.validation[field].required_error = false;
                    this.validation[field].length_error = true;
                } else {
                    this.validation[field].required_error = false;
                    this.validation[field].length_error = false;
                }
            }
        } else {
            this.validation[field] = {};
            if (isNaN(this.subscriber[field])) {
                var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                var result = re.test(this.subscriber[field]);
                if (!result) {
                    this.validation[field].required_error = false;
                    this.validation[field].invalid = true;
                    this.validation[field].error_message = "Email is invalid";
                } else {
                    this.validation[field].required_error = false;
                    this.validation[field].invalid = false;
                }
            } else {
                if (this.subscriber[field].length != 11) {
                    this.validation[field].required_error = false;
                    this.validation[field].invalid = true;
                    this.validation[field].error_message = "Phone is invalid";
                } else {
                    this.validation[field].required_error = false;
                    this.validation[field].invalid = false;
                }
            }
        }
    }

    repeatPassword() {
        this.passowrd_match_error = true;
    }

    checkMatch(text) {
        if (text == this.subscriber.password) {
            this.passowrd_match_error = false;
        } else {
            this.passowrd_match_error = true;
        }
    }

    signup(subscriber) {
        subscriber.is_enabled = true;
        subscriber.username = subscriber.email;
        subscriber.no_need_email_verify = true;
        let newSubs: any = {}
        if (!isNaN(subscriber.email)) {
            newSubs.phone_number = subscriber.email;
            newSubs.first_name = subscriber.first_name;
            newSubs.is_enabled = true;
            newSubs.no_need_email_verify = true;
            newSubs.password = subscriber.password;
            newSubs.repeatPassword = subscriber.repeatPassword;
            newSubs.username = subscriber.email;
        } else {
            newSubs = subscriber
        }

        this.orderCreateService.signup(newSubs).subscribe((response) => {
            if (response._id) {
                this.subscriber = {};
                window.localStorage.setItem('orderUser', JSON.stringify(response.user))
                this.registerMessage = "Subscriber created successfuly.";
            }
            else {
                this.registerMessage = response.message;
            }
            setTimeout(() => {
                this.registerMessage = "";
            }, 5000)
        });
    }

    // getSubscribers(text) {
    //     this.orderCreateService.getSearchedSubscriber(text).subscribe((result) => {
    //         this.phoneList = result.data;
    //     })
    // }

    getSelectedSubsCriber(data) {
        this.isClear = true;
        setTimeout(() => {
            this.isClear = false;
        }, 100)
        if (data._id) {
            let subscrib = data;
            window.localStorage.setItem('orderUser', JSON.stringify(subscrib))
            delete subscrib.password;
            this.subscriber = data;
            this.hasSubsCriber = true;
            this.orderCreateService.getShipingAddress(data._id).subscribe(shipping => {
                if (shipping.exist) {
                    this.hasAddress = true;
                    let dist_id = this.districts.find(dst => { return dst.DISTRICTT_NAME == shipping.data.district }).DISTRICT_NO;
                    this.orderCreateService.getThana(dist_id).subscribe(thanas => {
                        this.thanas = thanas;
                    })
                    let address = {
                        address: shipping.data.address,
                        district: shipping.data.district,
                        contact_name: shipping.data.contact_name,
                        phone_number: shipping.data.phone_number,
                        zip_code: shipping.data.zip_code,
                        thana: shipping.data.thana,
                        created_by: shipping.data.created_by,
                        _id: shipping.data._id
                    }
                    window.localStorage.setItem('orderAddress', JSON.stringify(address));
                    this.shipping = address;
                } else {
                    this.shipping = {};
                    this.hasAddress = false;
                    window.localStorage.removeItem('orderAddress')
                }
            })
        } else {
            this.subscriber = {};
            this.hasSubsCriber = true;
            window.localStorage.removeItem('orderUser');
        }
    }

    // Create Shipping Address


    //Product

    getData(text) {
        let search_data: any = { text: text }
        if (this.selectedAuthor && this.selectedAuthor._id) {
            search_data.author = this.selectedAuthor._id;
        }
        this.orderCreateService.getSearched(search_data).subscribe((result) => {
            this.dataList = result.product.filter(itm => {
                return this.selected_items_id.indexOf(itm._id) == -1;
            });
        })
    }


    getAuthorData(text) {
        this.orderCreateService.getSearchedAuthor(text).subscribe((result) => {
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
            this.selected_items_id.push(this.itemSelected._id);
            let item_obj = {
                item_id: this.itemSelected._id,
                item_name: this.itemSelected.name,
                item_image: 'https://d1jpltibqvso3j.cloudfront.net' + this.itemSelected.image,
                item_rate: this.itemSelected.price,
                item_qty: 1,
                author: this.itemSelected.authorObj.name,
                publisher: this.itemSelected.publisherObj.name
            }
            this.selectedItems.push(item_obj);
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
            this.orderCreateService.getItemByUrl(this.seo_url).subscribe(result => {
                if (result && result.product && result.product.length > 0) {
                    this.itemSelected = result.product[0];
                    let item_obj = {
                        item_id: this.itemSelected._id,
                        item_name: this.itemSelected.name,
                        item_image: 'https://d1jpltibqvso3j.cloudfront.net' + this.itemSelected.image,
                        item_rate: this.itemSelected.price,
                        item_qty: 1,
                        author: this.itemSelected.authorObj.name,
                        publisher: this.itemSelected.publisherObj.name
                    }
                    let exist_item = this.selectedItems.find(itm => { return itm._id == item_obj.item_id });
                    if (exist_item) {
                        this.selectedItems.map(itm => {
                            if (itm._id == item_obj.item_id) {
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
        this.selectedItems.map(itm => {
            this.total_cost += (itm.item_qty * itm.item_rate)
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


    submitOrder() {
        if (this.shipping && this.shipping.contact_name && this.shipping.contact_name != '' && this.shipping.district && this.shipping.thana && this.shipping.phone_number && this.shipping.phone_number.length == 11) {
            let total_book = 0
            let order_data = {
                payable_amount: 0,
                products: this.selectedItems.map(item => {
                    total_book += item.item_qty;
                    return {
                        product_id: item.item_id,
                        name: item.item_name,
                        image: item.item_image,
                        quantity: item.item_qty,
                        price: item.item_rate,
                        author: item.author,
                        publisher: item.publisher
                    }
                }),
                total_book: total_book,
                total_price: this.total_cost,
                send_sms: this.order.send_sms,
                delivery_charge: this.order.delivery_charge ? this.order.delivery_charge : 0,
                discount: this.order.discount ? this.order.discount : 0,
                wrapping_charge: this.order.wrapping_charge ? this.order.wrapping_charge : 0,
                delivery_address: this.shipping,
                created_from: this.order.created_from
            }
            order_data.payable_amount = order_data.total_price + order_data.wrapping_charge + order_data.delivery_charge - order_data.discount;
            this.orderCreateService.add(order_data).subscribe((result) => {
                if (result.success) {
                    this.selectedItems = [];
                    this.total_cost = 0;
                    this.shipping = {};
                    this.alerts.push({
                        type: 'info',
                        msg: "Order submitted successfully.",
                        timeout: 2000
                    });
                } else {
                    this.alerts.push({
                        type: 'danger',
                        msg: "Order create failed.",
                        timeout: 2000
                    });
                }
            })
        } else {
            this.alerts.push({
                type: 'danger',
                msg: "Invalid Shipping Address",
                timeout: 2000
            });
        }
    }
}