import { Component, ViewEncapsulation, ViewChild } from "@angular/core";

import { PaymentCollectionService } from "./payment-collection.service";
import { ExcelService } from 'app/shared/services/excel-export.service';

@Component({
  selector: "payment-collection",
  templateUrl: "./payment-collection.html",
  styleUrls: ['./payment-collection.scss']
})
export class PaymentCollectionComponent {
  //Collect From Customer
  public requested_orderno: number;
  public selectedOrder: any = {};
  public cust_pay_info: any = {};

  //Collect From carrier
  public orders: any = [];
  public alerts: any = [];
  public summary: number = 0;
  public selectedall: boolean;
  public payementGatewayes: Array<any> = [];
  public carrier_summary: number = 0;
  public cost_summary: number = 0;
  public carrier: any = {};
  public carriers: Array<any> = [];
  public selected_items: Array<any> = [];
  public res_pending: boolean;
  public carrier_charge: number = 40;
  public collection_charge: number = 20;
  public submitted: boolean;

  //Carrier Payment
  public carr_pay: any = {};
  public unpaid_carr_cost_orders: Array<any> = [];
  public carr_cost_summary: number = 0;
  public selectedall1: boolean;

  //Collection From Excel

  public excel_collection: any = [];

  constructor(
    public _paymentCollectionService: PaymentCollectionService,
    public _excelService: ExcelService,
    public excelService: ExcelService
  ) { }

  ngOnInit() {
    this._paymentCollectionService.getCarriers().subscribe(outpt => {
      this.carriers = outpt.data;
    });
    this._paymentCollectionService.getPayementGatewayes().subscribe(outpt => {
      this.payementGatewayes = outpt;
    });
  }

  //Refund
  getPaidOSearchOrder() {
    this.submitted = false;
    this._paymentCollectionService
      .getPaidOrdersByOrderNo(this.requested_orderno)
      .subscribe(output => {
        if (output.order) {
          this.selectedOrder = output.order;
        } else {
          this.alerts.push({
            type: "danger",
            msg: output.message,
            timeout: 4000
          });
        }
      });
  }

  refundPayment() {
    this.res_pending = true;
    this.submitted = true;

    console.log(this.selectedOrder.order_no)


    if (
      this.selectedOrder.payment_information.currency_amount &&
      this.selectedOrder.payment_information.currency
    ) {
      this.submitted = false;

      let data = {
        trx_id: this.selectedOrder.payment_information.bank_tran_id,
        currency_amount: this.selectedOrder.payment_information.currency_amount,
        currency: this.selectedOrder.payment_information.currency
      };

      this._paymentCollectionService.saveRefund(data).subscribe(output => {
        console.log('refun output');
        console.log(output);
        this.res_pending = false;
      });
    } else {
      this.res_pending = false;
    }
  }

  //Collect From Customer
  getSearchOrder() {
    this.submitted = false;
    this._paymentCollectionService
      .getOrdersByOrderNo(this.requested_orderno)
      .subscribe(output => {
        console.log("output");
        console.log(output);
        if (output.order) {
          this.selectedOrder = output.order;
        } else {
          this.alerts.push({
            type: "danger",
            msg: output.message,
            timeout: 4000
          });
        }
      });
  }

  collectCustomerPayment() {
    this.res_pending = true;
    this.submitted = true;
    if (
      this.cust_pay_info.carrier_id &&
      this.cust_pay_info.gateway_id &&
      this.cust_pay_info.pay_amount &&
      this.cust_pay_info.transaction_id &&
      this.cust_pay_info.transaction_cost &&
      this.cust_pay_info.transaction_date
    ) {
      this.submitted = false;
      this.cust_pay_info.transaction_cost = this.cust_pay_info.transaction_cost
        ? this.cust_pay_info.transaction_cost
        : 0;
      this.cust_pay_info.tax_amount = this.cust_pay_info.tax_amount
        ? this.cust_pay_info.tax_amount
        : 0;
      let data = {
        collected_amount: this.cust_pay_info.pay_amount,
        transaction_id: this.cust_pay_info.transaction_id,
        transaction_date: this.cust_pay_info.transaction_date || new Date(),
        transaction_comment: this.cust_pay_info.transaction_comment,
        order_amount: this.selectedOrder.payable_amount,
        order_list: [this.selectedOrder._id],
        order_carrier: this.cust_pay_info.carrier_id,
        collection_gatway: this.cust_pay_info.gateway_id,
        payment_info: [
          {
            is_full_collected:
              this.selectedOrder.payable_amount ==
              this.selectedOrder.payment_collection.total_paid +
              this.cust_pay_info.pay_amount,
            total_paid:
              this.selectedOrder.payment_collection.total_paid +
              this.cust_pay_info.pay_amount,
            carrier_cost: 0,
            order_no: this.selectedOrder.order_no,
            transaction_cost:
              this.selectedOrder.payment_collection.transaction_cost +
              this.cust_pay_info.transaction_cost,
            tax_amount:
              this.selectedOrder.payment_collection.tax_amount +
              this.cust_pay_info.tax_amount,
            collected_amount: this.cust_pay_info.pay_amount,
            collected_at: this.cust_pay_info.transaction_date || new Date(),
            carrier: this.cust_pay_info.carrier_id,
            due_amount:
              this.selectedOrder.payable_amount -
              (this.selectedOrder.payment_collection.total_paid +
                this.cust_pay_info.pay_amount),
            gateway_ref: this.cust_pay_info.gateway_id,
            _id: this.selectedOrder._id
          }
        ]
      };
      let isInShipment = this.selectedOrder.performed_order_statuses.find(
        stat => {
          return stat.status_name == "Inshipment";
        }
      );

      this._paymentCollectionService.save(data).subscribe(output => {
        this.res_pending = false;
        if (output.success) {
          this.alerts.push({
            type: "info",
            msg: "Successfully Submitted.",
            timeout: 4000
          });
          this.cust_pay_info = {};
          this.selectedOrder = {};
        } else {
          this.alerts.push({
            type: "danger",
            msg: "Payment submition failed!",
            timeout: 4000
          });
        }
      });
    } else {
      this.res_pending = false;
    }
  }
  //Collect From carrier
  onChangeSelectedAll() {
    this.changeAllOrder().then(rslt => {
      this.updateSummary();
    });
  }

  changeAllOrder() {
    return new Promise(resolve => {
      this.orders = this.orders.map(order => {
        order.is_selected = this.selectedall;
        return order;
      });
      resolve({});
    });
  }

  onChangeSelectedOne(status) {
    this.changeOneOrder(status).then(rslt => {
      this.updateSummary();
    });
  }

  changeOneOrder(status) {
    return new Promise(resolve => {
      if (status) {
        let hasFalse = this.orders.find(order => {
          return !order.is_selected;
        });
        if (!hasFalse) {
          this.selectedall = true;
        } else {
          this.selectedall = false;
        }
      } else {
        this.selectedall = false;
      }
      resolve({});
    });
  }

  getOrder() {
    this.submitted = false;
    this.orders = [];
    this.alerts = [];
    this.summary = 0;
    this.carrier_summary = 0;
    this.cost_summary = 0;
    this.selectedall = true;
    this._paymentCollectionService
      .getOrdersByCarriers(this.carrier.carrier_id)
      .subscribe(outpt => {
        if (outpt.length > 0) {
          this.orders = outpt.map(out => {
            out.is_selected = true;
            if (this.carrier.carrier_id == '5adebee21ba7c84ec136145d') {
              out.carrier_pay = out.due_amount - this.collection_charge;
            } else {
              out.carrier_pay = out.due_amount - this.carrier_charge;
            }
            // console.log('this.carrier.carrier_id')
            // console.log(this.carrier.carrier_id)
            if (this.carrier.carrier_id == '5adebee21ba7c84ec136145d') {
              out.collection_charge = 20;
            } else {
              out.collection_charge = 0;
            }
            this.carrier_summary += out.carrier_pay;
            this.cost_summary += this.carrier_charge;
            this.summary += out.due_amount;
            return out;
          });
        } else {
          this.alerts.push({
            type: "danger",
            msg: "No order found!",
            timeout: 4000
          });
        }
      });
  }

  updateSummary() {

    let selectedOrders = this.orders.filter(ords => {
      return ords.is_selected;
    });

    this.summary = 0;
    this.carrier_summary = 0;
    this.cost_summary = 0;

    selectedOrders.map(out => {
      this.carrier_summary += out.carrier_pay;
      this.cost_summary += out.due_amount - out.carrier_pay;
      this.summary += out.due_amount;
    });
  }

  submit() {
    this.submitted = true;
    if (this.carrier.gateway_id) {
      this.submitted = false;
      this.alerts = [];
      let validPayments = this.orders.filter(ord => {
        return ord.is_selected && ord.carrier_pay; //&& ord.carrier_pay > 0 && ord.due_amount >= ord.carrier_pay;
      });

      if (validPayments.length > 0) {
        this.res_pending = true;

        let data = {
          collected_amount: this.carrier_summary,
          order_amount: this.summary,
          order_list: validPayments.map(pay => {
            return pay._id;
          }),
          order_carrier: this.carrier.carrier_id,
          collection_gatway: this.carrier.gateway_id,
          payment_info: validPayments.map(pay => {
            let carrierCost = pay.due_amount - pay.carrier_pay;
            let collectedAmount = pay.carrier_pay;
            if (this.carrier.carrier_id == '5adebee21ba7c84ec136145d') {
              carrierCost = 40 + (pay.due_amount - (pay.carrier_pay + pay.collection_charge));
              collectedAmount = pay.due_amount - (carrierCost + pay.collection_charge);
            }
            return {
              carrier: this.carrier.carrier_id,
              is_full_collected: true,
              total_paid: pay.payable_amount,
              carrier_cost: carrierCost,
              collected_amount: collectedAmount,
              collection_charge: pay.collection_charge,
              collected_at: new Date(),
              due_amount: 0,
              order_no: pay.order_no,
              gateway_ref: this.carrier.gateway_id,
              _id: pay._id
            };
          })
        };
        this._paymentCollectionService.save(data).subscribe(output => {
          this.res_pending = false;
          if (output.success) {
            this.alerts.push({
              type: "info",
              msg: "Successfully Submitted.",
              timeout: 4000
            });
            setTimeout(() => {
              this.carrier = {};
              this.orders = [];
            }, 3000);
          } else {
            this.alerts.push({
              type: "danger",
              msg: "Payment submition failed!",
              timeout: 4000
            });
          }
        });
      } else {
        this.alerts.push({
          type: "danger",
          msg: "Select order first!",
          timeout: 4000
        });
      }
    }
  }

  //Carrier Payment

  getCarrPayOrder() {
    this._paymentCollectionService
      .getUunpaidCarrOrder(this.carr_pay.carrier_id)
      .subscribe(outpt => {
        if (outpt.length > 0) {
          this.unpaid_carr_cost_orders = outpt.map(out => {
            out.carrier_cost = 40;
            return out;
          });
          this.calculateSummary(this.unpaid_carr_cost_orders);
        } else {
        }
      });
  }

  changeCarrCost() {
    this.calculateSummary(this.unpaid_carr_cost_orders);
  }

  calculateSummary(ords) {
    this.carr_cost_summary = 0;
    ords
      .filter(ord => {
        return ord.is_selected;
      })
      .map(carr_cost => {
        this.carr_cost_summary += carr_cost.carrier_cost;
      });
  }

  onChangeSelectedAll1() {
    this.unpaid_carr_cost_orders.map(order => {
      order.is_selected = this.selectedall1;
      return order;
    });
    this.calculateSummary(this.unpaid_carr_cost_orders);
  }

  onChangeSelectedOne1(status) {
    if (status) {
      let hasFalse = this.unpaid_carr_cost_orders.find(order => {
        return !order.is_selected;
      });
      this.selectedall1 = !hasFalse;
    } else {
      this.selectedall1 = false;
    }
    this.calculateSummary(this.unpaid_carr_cost_orders);
  }

  submitCarrColl() {
    this.alerts = [];
    let slctOrder = this.unpaid_carr_cost_orders
      .filter(unpaid => {
        return unpaid.is_selected;
      })
      .map(rslt => {
        return {
          _id: rslt._id,
          carrier_cost: rslt.carrier_cost,
          carrier: rslt.carrier,
          order_no: rslt.order_no
        };
      });

    if (slctOrder.length > 0) {
      this._paymentCollectionService
        .updateCarrCost({ orders: slctOrder })
        .subscribe(output => {
          this.res_pending = false;
          if (output.success) {
            this._paymentCollectionService
              .updateCarrierCost({ orders: slctOrder })
              .subscribe(transac => {
                console.log(transac);
              });
            this.carr_pay = {};
            this.unpaid_carr_cost_orders = [];
            this.alerts.push({
              type: "info",
              msg: "Successfully Submitted.",
              timeout: 4000
            });
          } else {
            this.alerts.push({
              type: "danger",
              msg: "Payment submition failed!",
              timeout: 4000
            });
          }
        });
    } else {
      this.alerts.push({
        type: "danger",
        msg: "Select order first!",
        timeout: 4000
      });
    }
  }

  downloadExcel() {
    this._paymentCollectionService.getCollectableOrder(this.carrier.carrier_id).subscribe((result: any) => {
      if (result && Array.isArray(result) && result.length > 0) {
        let d = new Date();
        let collection_data = result.map(collection => {
          collection.bkash = 0;
          collection.ssl = 0;
          collection.bkash_charge = 0;
          collection.wallet_pay = 0;
          collection.ssl_charge = 0;
          collection.return_amount = collection.return_amount ? collection.return_amount : 0;
          collection.return_charge = collection.return_charge ? collection.return_charge : 0;
          collection.collection_charge = 0;
          collection.deposit_to_bank = 0;
          collection.cash = 0;
          collection.promotion = 0;
          collection.deposit_date = (d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear();
          if (Array.isArray(collection.collection_info) && collection.collection_info.length > 0) {
            collection.collection_info.map(info => {
              if (info.gateway_ref && info.gateway_ref.name == 'Bkash') {
                collection.bkash += info.collected_amount;
                collection.bkash_charge = info.collection_charge ? info.collection_charge : (((info.collected_amount ? info.collected_amount : 0) * 1.5) / 100);
              }
              if (info.gateway_ref && info.gateway_ref.name == 'Online Payment') {
                collection.ssl = info.collected_amount;
                collection.ssl_charge += info.collection_charge ? info.collection_charge : (((info.collected_amount ? info.collected_amount : 0) * 2.5) / 100);
              }
              if (info.gateway_ref && info.gateway_ref.name == 'Wallet Payment') {
                collection.wallet_pay = info.collected_amount;
              }
            })
          }
          collection.challan_amount = collection.total_price + collection.return_amount;
          return {
            deposit_date: collection.deposit_date,
            order_no: collection.order_no,
            challan_amount: collection.challan_amount,
            sales_discount: collection.sales_discount,
            return_amount: collection.order_status == 'Returned' ? collection.total_price : collection.return_amount,
            packing_cost: collection.packing_cost,
            delivery_charge: collection.delivery_charge,
            courier_charge_in_advance: this.carrier.carrier_id == '5adebee21ba7c84ec136145d' || this.carrier.carrier_id == '5ba8694706c5064bef76f573' ? collection.courier_charge : 0,
            courier_charge: this.carrier.carrier_id == '5adebee21ba7c84ec136145d' || this.carrier.carrier_id == '5ba8694706c5064bef76f573' ? 0 : collection.courier_charge,
            return_charge: collection.return_charge,
            collection_charge: collection.collection_charge,
            bkash: collection.bkash,
            ssl: collection.ssl,
            wallet_pay: collection.wallet_pay,
            bkash_charge: collection.bkash_charge,
            ssl_charge: collection.ssl_charge,
            deposit_to_bank: collection.deposit_to_bank,
            cash: collection.cash,
            promotion: collection.promotion
          };
        })
        this.excelService.exportAsExcelFile(collection_data, 'boibazar_payment_collection');
      } else {
        this.alerts.push({
          type: "danger",
          msg: "No order found for this courier.",
          timeout: 4000
        });
      }
    })
  }

  onCourierChange() {
    this.excel_collection = [];
  }

  onFileSelect(event) {
    this.excel_collection = [];
    let d = new Date();
    this._excelService.importExcel(event)
      .then(data => {
        if (data && Array.isArray(data) && data.length > 0) {
          let collections: any = data.map(dt => {
            let obj: any = {
              bkash: 0,
              bkash_charge: 0,
              cash: 0,
              challan_amount: 0,
              collection_charge: 0,
              courier_charge_in_advance: 0,
              courier_charge: 0,
              delivery_charge: 0,
              deposit_date: (d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear(),
              deposit_to_bank: 0,
              order_no: '000000',
              packing_cost: 0,
              promotion: 0,
              return_amount: 0,
              wallet_pay: 0,
              return_charge: 0,
              sales_discount: 0,
              ssl: 0,
              ssl_charge: 0,
            };
            Object.keys(dt).forEach(key => {
              if (key == 'deposit_date' || key == 'order_no')
                obj[key] = dt[key]
              else
                obj[key] = parseFloat(dt[key]);
            })
            return obj;
          })
          let balance = 0;
          this.excel_collection = collections.map(dt => {
            dt.net_sales_amount = dt.challan_amount - dt.return_amount;
            dt.total_amount = dt.net_sales_amount + dt.packing_cost + dt.delivery_charge;
            if (dt.challan_amount == dt.return_amount) {
              balance += (0 - (dt.collection_charge + dt.courier_charge));
            } else {
              balance += (dt.total_amount - (dt.wallet_pay + dt.bkash + dt.ssl + dt.cash + dt.deposit_to_bank + dt.collection_charge + dt.courier_charge));
            }
            dt.balance = balance;
            return dt;
          });
        }
      })
  }

  uploadExcelData() {
    let data = { collection: this.excel_collection, courier: this.carrier.carrier_id };
    this.res_pending = true;
    this._paymentCollectionService.excelColelction(data).subscribe(result => {
      this.res_pending = false;
      if (result.success) {
        this.carrier = {};
        this.excel_collection = [];
        this.alerts.push({
          type: "info",
          msg: "Successfully Submitted.",
          timeout: 4000
        });
      } else {
        this.alerts.push({
          type: "danger",
          msg: 'Failed! ' + result.message,
          timeout: 4000
        });
      }
    })
  }

}
