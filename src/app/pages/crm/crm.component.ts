import { Component, ViewChild } from '@angular/core';
import { ModalDirective } from 'ng2-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';

import { CRMData } from './crm.data';
import { CRMService } from './crm.service';

@Component({
  selector: 'crm-app',
  styleUrls: ['./crm.scss'],
  templateUrl: './crm.html',
})
export class CrmComponent {

  public totalItems: number;
  public currentPage: number = 1;
  public maxSize: number = 5;
  public is_subscriber: boolean;
  public subscriber: any = {};
  public record: any = {};
  public hasAddress: boolean;
  public submitted: boolean;
  public res_pending: boolean;
  public alerts = [];
  public query_types: any = new CRMData().QUERY_TYPES;
  public new_customer: any = {};
  public is_new_customer: boolean;
  public districts: any = [];
  public thanas: any = [];
  public customer_phone: string;
  public otherOperation: boolean;
  public userCreated: boolean;

  //Order Create
  public order: any = { delivery_charge: 30, discount: 0, wrapping_charge: 0 };
  shipping: any = { contact_name: "" };
  public validation: any = {};
  public isSavedAddress: boolean;

  // Product
  dataList: Array<any> = [];
  show_image: boolean = true;
  public selectedItems: any = [];
  public itemSelected: any = {};
  private selected_items_id: any = [];
  public total_cost: number = 0;
  public isClear: boolean = false;

  //Exist Order
  public exist_orders: any = [];
  public selectedOrder: any = {};

  //Payment
  public carriers: Array<any> = [];
  public payementGatewayes: Array<any> = [];
  public cust_pay_info: any = {};

  // Book Query
  public query: any = {};
  public query_message: string;
  public showForm: boolean;

  @ViewChild('orderCreateModal') orderCreateModal: ModalDirective;
  @ViewChild('existBookOrderModal') existBookOrderModal: ModalDirective;
  @ViewChild('paymentModalModal') paymentModalModal: ModalDirective;
  @ViewChild('bookQueryModal') bookQueryModal: ModalDirective;

  constructor(private _cRMService: CRMService, private route: ActivatedRoute, ) {

  }

  ngOnInit() {
    this.customer_phone = this.route.snapshot.params['phone_number'];
    this.getInfo();
    this._cRMService.getDistrict().subscribe(districts => {
      this.districts = districts;
    })

    this._cRMService.getCarriers().subscribe(outpt => {
      this.carriers = outpt.data;
    });
    this._cRMService.getPayementGatewayes().subscribe(outpt => {
      this.payementGatewayes = outpt;
    });
  }

  getInfo() {
    this._cRMService.getInfo(this.customer_phone).subscribe(c_data => {
      if (c_data.count > 0) {
        this.record = c_data.data[0];
        this.record.name == "anonymous" ? '' : this.record.name;
        this.is_subscriber = c_data.is_subscriber;
        this.subscriber = c_data.subscr_info;
      } else {
        this.is_new_customer = true;
        this.is_subscriber = c_data.is_subscriber;
        this.subscriber = c_data.subscr_info;
        if (c_data.is_subscriber) {
          this.record.name = c_data.subscr_info.first_name;
        }
      }
      if (this.record.name == 'anonymous') delete this.record.name;
    })
  }

  openQueryModal(q_type) {
    this.userCreated = false;
    this.otherOperation = false;
    this.selectedOrder = {};
    switch (q_type) {
      case 'new_book_order':
        if (this.is_subscriber) {
          this._cRMService.getSubscrAddress(this.subscriber._id).subscribe(result => {
            if (result.exist) {
              this.shipping = result.data;
              window.localStorage.setItem("shppnAddress", JSON.stringify(this.shipping));
              this.hasAddress = true;
              let dist_id = this.districts.find(dst => { return dst.DISTRICTT_NAME == this.shipping.district }).DISTRICT_NO;
              this._cRMService.getThana(dist_id).subscribe(thanas => {
                this.thanas = thanas;
              })
            } else {
              this.shipping.contact_name = this.subscriber.first_name;
              this.shipping.phone_number = this.customer_phone;
            }
          })
        } else {
          this.shipping.contact_name = this.record.name;
          this.shipping.phone_number = this.customer_phone;
        }
        this.orderCreateModal.show();
        break;
      case 'existing_book_order':
        this._cRMService.getCustomerOrderByPhone(this.customer_phone).subscribe(result => {
          this.exist_orders = result;
        })
        this.existBookOrderModal.show();
        break;
      case 'payment':
        this._cRMService.getCustomerOrderByPhone(this.customer_phone).subscribe(result => {
          this.exist_orders = result;
        })
        this.paymentModalModal.show();
        break;
      case 'query_for_book':
        this.bookQueryModal.show();
        break;
      default:
        this.otherOperation = true;
    }

  }

  selectDistrict(selectedName) {
    let dist_id = this.districts.find(dst => { return dst.DISTRICTT_NAME == selectedName }).DISTRICT_NO;
    this._cRMService.getThana(dist_id).subscribe(thanas => {
      this.thanas = thanas;
    })
  }

  setPage(): void {
    console.log(this.currentPage);
  }

  cancel(currentModal) {
    this[currentModal].hide();
    this.record.query_type = undefined;
    this.record.comment = undefined;
  }

  // Create Shipping Address

  saveAddress() {
    if (!this.shipping.contact_name || !this.shipping.district || !this.shipping.thana || !this.shipping.address || !this.shipping.phone_number) {
      this.alerts.push({
        type: 'danger',
        msg: "Please, provide all required data.",
        timeout: 2000
      });
    } else {
      window.localStorage.setItem("shppnAddress", JSON.stringify(this.shipping));
      this.alerts.push({
        type: 'info',
        msg: "Address saved, Add book now.",
        timeout: 2000
      });
      setTimeout(() => {
        this.isSavedAddress = true;
      }, 1800)
    }
  }


  //Product

  getData(text) {
    this._cRMService.getSearched({text:text}).subscribe((result) => {
      this.dataList = result.product.filter(itm => {
        return this.selected_items_id.indexOf(itm._id) == -1;
      });
    })
  }

  getSelected(data) {
    this.itemSelected = data;
  }

  addItemToList() {
    if (this.itemSelected && this.itemSelected._id) {
      this.isClear = true;
      setTimeout(() => {
        this.isClear = false;
      }, 100)
      this.selected_items_id.push(this.itemSelected._id);
      let item_obj = {
        item_id: this.itemSelected._id,
        item_name: this.itemSelected.name,
        item_image: this.itemSelected.image,
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
    let delivery_address = JSON.parse(window.localStorage.getItem('shppnAddress'));
    if (!delivery_address) {
      this.alerts.push({
        type: 'danger',
        msg: "Save address first!",
        timeout: 2000
      });
    } else {
      if (this.is_subscriber) {
        let user_of_order = this.subscriber;
        if (delivery_address._id) {
          this.createOrder(delivery_address, user_of_order);
        } else {
          this.shipping.created_by = user_of_order._id;
          this._cRMService.saveAddress(this.shipping).subscribe((response) => {
            if (response && response.data && response.data._id) {
              this.createOrder(delivery_address, user_of_order);
            }
          })
        }
      } else {
        this.saveAsSubscriber().then((user: any) => {
          let user_of_order = user;
          this.shipping.created_by = user_of_order._id;
          this._cRMService.saveAddress(this.shipping).subscribe((response) => {
            if (response && response.data && response.data._id) {
              this.createOrder(delivery_address, user_of_order);
            }
          })
        })
      }
    }
  }


  saveAsSubscriber() {
    return new Promise((resolve, reject) => {
      let newSubs: any = {}
      newSubs.phone_number = this.customer_phone;
      newSubs.first_name = this.record.name;
      newSubs.is_enabled = true;
      newSubs.no_need_email_verify = true;
      newSubs.password = "abfdceDsa";
      newSubs.repeatPassword = "abfdceDsa";
      newSubs.created_by_admin = true;
      newSubs.username = this.customer_phone;

      this._cRMService.signup(newSubs).subscribe((response) => {
        if (response._id) {
          this.userCreated = true;
          resolve(response.user);
        }
      })
    })
  }

  createOrder(delivery_address, user_of_order) {
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
      delivery_charge: this.order.delivery_charge ? this.order.delivery_charge : 0,
      discount: this.order.discount ? this.order.discount : 0,
      wrapping_charge: this.order.wrapping_charge ? this.order.wrapping_charge : 0,
      delivery_address: delivery_address,
      created_by: user_of_order._id,
      created_from: "CallCenter"
    }
    order_data.payable_amount = order_data.total_price + order_data.wrapping_charge + order_data.delivery_charge - order_data.discount;

    this._cRMService.add(order_data).subscribe((result) => {
      if (result.success) {
        this.record.district = delivery_address.district;
        this.record.thana = delivery_address.thana;
        this.record.address = delivery_address.address;
        this.record.is_order_related = true;
        this.record.order = result._id;
        this.record.comment = "New order created.";
        this.saveRecord('orderCreateModal');
      }
    })
  }

  collectCustomePayment() {
    if (this.cust_pay_info.carrier_id && this.cust_pay_info.gateway_id && this.cust_pay_info.pay_amount) {
      let data = {
        collected_amount: this.cust_pay_info.pay_amount,
        order_amount: this.selectedOrder.payable_amount,
        order_list: [this.selectedOrder._id],
        order_carrier: this.cust_pay_info.carrier_id,
        collection_gatway: this.cust_pay_info.gateway_id,
        payment_info: [{
          is_full_collected: this.selectedOrder.payable_amount == (this.selectedOrder.payment_collection.total_paid + this.cust_pay_info.pay_amount),
          total_paid: this.selectedOrder.payment_collection.total_paid + this.cust_pay_info.pay_amount,
          carrier_cost: 0,
          collected_amount: this.cust_pay_info.pay_amount,
          collected_at: new Date(),
          due_amount: (this.selectedOrder.payable_amount - (this.selectedOrder.payment_collection.total_paid + this.cust_pay_info.pay_amount)),
          gateway_ref: this.cust_pay_info.gateway_id,
          _id: this.selectedOrder._id
        }]
      }

      this._cRMService.savePayment(data).subscribe(output => {
        if (output.success) {
          this.record.district = this.selectedOrder.delivery_address.district;
          this.record.thana = this.selectedOrder.delivery_address.thana;
          this.record.address = this.selectedOrder.delivery_address.address;
          this.record.is_order_related = true;
          this.record.order = this.selectedOrder._id;
          this.record.comment = "Payment Collected";
          this.saveRecord('paymentModalModal');
        }
      })
    }
  }

  saveRecord(currentModal) {
    this.submitted = true;
    if (this.record.comment) {
      this.res_pending = true;
      this.submitted = false;
      this.record.phone_number = this.record.phone_number ? this.record.phone_number : this.customer_phone;
      this.record.called_at = new Date(),
        this.record.call_duration = 5.20,
        this.record.customer_info = {
          name: this.record.name || "anonymous",
          email: this.record.email,
          district: this.record.district,
          thana: this.record.thana,
          address: this.record.address
        }
      this.record.query_info = {
        query_type: this.record.query_type,
        is_order_related: this.record.is_order_related,
        order: this.record.order
      }
      this._cRMService.saveRecord(this.record).subscribe(result => {
        this.res_pending = false;
        if (result.success) {
          this.record.query_type = undefined;
          this.record.comment = undefined;
          this.getInfo();
          this.selectedOrder = {};
          if (this.record.name && this.record.name != 'anonymous' && !this.userCreated) {
            this.saveAsSubscriber()
              .then((user: any) => {

              })
          }
          this.alerts.push({
            type: 'info',
            msg: "Submitted successfully!",
            timeout: 2000
          });
          window.localStorage.removeItem('shppnAddress');
          setTimeout(() => {
            if (currentModal != 'notModal') this[currentModal].hide();
          }, 2000)
        }
      })
    }
  }

  //Customer Query
  validate(field) {
    this.validation[field] = { required_error: false, length_error: false }
    if (this.query[field].length == 0) {
      this.validation[field].required_error = true;
    } else {
      if (this.query[field].length < 4) {
        this.validation[field].required_error = false;
        this.validation[field].length_error = true;
      } else {
        this.validation[field].required_error = false;
        this.validation[field].length_error = false;
      }
    }
  }

  submitQuery(query, currentModal) {
    query.called_at = new Date(),
      query.customer_info = {
        name: query.name
      }
    query.query_info = {
      query_type: this.record.query_type,
      is_order_related: false,
    }
    query.phone_number = this.record.phone_number;
    query.from = 'CRM';
    this._cRMService.recodForBookQuery(query).subscribe(result => {
      this.res_pending = false;
      this.query = {};
      if (result.success) {
        this.record.query_type = undefined;
        this.record.comment = undefined;
        this.getInfo();
        this.alerts.push({
          type: 'info',
          msg: "Submitted successfully!",
          timeout: 2000
        });
        setTimeout(() => {
          if (currentModal != 'notModal') this[currentModal].hide();
        }, 2000)
      }
    })
  }

}
