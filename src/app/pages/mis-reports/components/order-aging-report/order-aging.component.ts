import { Component, ViewChild } from "@angular/core";

import { OrderAgingService } from './order-aging.service';
import { ModalDirective } from 'ng2-bootstrap';


@Component({
  selector: 'order-aging',
  templateUrl: './order-aging.html',
  styleUrls: ['./order-aging.scss']
})
export class OrderAgingComponent {
  wait: boolean;
  result_set: any = {};
  alerts: any = [];
  products: any = [];
  orders: any = [];
  selected_ids: any = []
  is_found_detail: boolean;

  public totalItems: number;
  public currentPage: number = 1;
  public maxSize: number = 5;

  @ViewChild('viewBookModal') viewBookModal: ModalDirective;

  constructor(
    private _orderAgingService: OrderAgingService
  ) { }

  ngOnInit() {
    this.getData();
  }

  getData() {
    this.wait = true;
    this._orderAgingService.get().subscribe(result => {
      console.log('result')
      console.log(result)
      this.wait = false;
      if (result.success) {
        this.result_set = result.data
      } else {
        this.alerts.push({
          type: 'danger',
          msg: "Internal server error.",
          timeout: 4000
        });
      }
    })
  }

  showDetail(orders) {
    this.selected_ids = orders;
    this.totalItems = orders.length;
    this.getDetail(this.selected_ids);
  }

  getDetail(orders) {
    this._orderAgingService.getDetail({ ids: orders }, this.currentPage).subscribe(result => {
      this.is_found_detail = true;
      this.orders = result.data;
    })
  }

  setPage(pageNum): void {
    this.currentPage = pageNum;
    this.getDetail(this.selected_ids);
  }

  viewBooks(order_id) {
    this._orderAgingService.getBooks(order_id).subscribe(result => {
      this.products = result.data[0].products;
      console.log(result)
      console.log(this.products)
    })

    this.viewBookModal.show();
    // console.log(order_id)
  }


}
