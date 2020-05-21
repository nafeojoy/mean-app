import { Component } from "@angular/core";
import { ActivatedRoute, Router } from '@angular/router';
import { PartialOrderReturnService } from './partial-return.service';
import { Location } from '@angular/common';

@Component({
  selector: 'partial-order-return',
  templateUrl: './partial-return.html',
  styleUrls: ['./partial-return.scss']
})

export class PartialOrderReturnComponent {

  private order_id: string;
  private order: any = {};
  public selectedItems: any = [];
  public returnedItems: any = [];
  current_payable_amount: number = 0;
  total_cost: number = 0;
  total_book: number = 0;
  alerts: any = [];
  editing_item_quantity: number = 0;
  res_pending: boolean;

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private _partialOrderReturnService: PartialOrderReturnService
  ) { }

  ngOnInit() {
    this.order_id = this.route.snapshot.params['id'];
    this._partialOrderReturnService.getById(this.order_id).subscribe(result => {
      if (result._id) {
        this.order = result;
        this.current_payable_amount = this.order.payable_amount;
        this.selectedItems = this.order.products.map(prd => {
          prd.author = prd.authors[0].name;
          prd.publisher = prd.publisher.name;
          prd.original_qty = prd.quantity;
          return prd;
        });
        this.updateTotalCost();
      }
    })
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
    itm.is_edit = false;
  }

  remove(itm, indx) {
    this.selectedItems.splice(indx, 1);
    this.updateTotalCost();
    this.returnedItems.push({
      product_id: itm._id,
      name: itm.name,
      quantity: itm.quantity,
      price: itm.price
    })
  }

  returnItems() {
    this.total_book = 0;
    let returned_items_price = 0;
    let delivered_items = this.selectedItems.map(itm => {
      this.total_book += itm.quantity;
      if (itm.original_qty > itm.quantity) {
        this.returnedItems.push({
          product_id: itm._id,
          name: itm.name,
          quantity: itm.original_qty - itm.quantity,
          price: itm.price
        })
      }
      return {
        send: itm.send,
        is_out_of_stock: false,
        arrives_in_stock: 0,
        is_out_of_print: false,
        is_info_delay: false,
        info_delayed: 0,
        product_id: itm._id,
        name: itm.name,
        quantity: itm.quantity,
        price: itm.price,
        author: itm.authors[0].name,
        publisher: itm.publisher
      }
    })
    this.returnedItems.map(itm => {
      returned_items_price += (itm.quantity * itm.price)
    })
    let update_value = {
      _id: this.order._id,
      total_book: this.total_book,
      total_price: this.total_cost,
      discount: this.order.discount,
      delivery_charge: this.order.delivery_charge,
      products: delivered_items,
      payable_amount: this.total_cost + this.order.delivery_charge + this.order.wrapping_charge - this.order.discount,
      returned_cost: this.order.return_cost ? this.order.return_cost : 0,
      is_partially_returned: true,
      returned_items: this.returnedItems,
      returned_items_price: returned_items_price
    }
    if (this.returnedItems.length > 0) {
      this.res_pending = true;
      this._partialOrderReturnService.update(update_value).subscribe(result => {
        if (result.success) {
          this.alerts.push({
            type: 'info',
            msg: "Return completed successfully.",
            timeout: 2000
          });
          setTimeout(() => {
            this.res_pending = false;
            this.location.back()
          }, 2000);
        } else {
          this.alerts.push({
            type: 'danger',
            msg: "Failed! Internal server error.",
            timeout: 2000
          });
          this.res_pending = false;
        }
      })
    } else {
      this.alerts.push({
        type: 'danger',
        msg: "Invalid! No item selected to be removed.",
        timeout: 2000
      });
    }
  }

}