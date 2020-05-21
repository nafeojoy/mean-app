import { Component, ViewEncapsulation, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { Subject } from 'rxjs/Subject';

import { ReportService } from '../report.service';
import { DatePipe } from "@angular/common";

import 'style-loader!../report.scss';

@Component({
    selector: 'sales-report',
    templateUrl: './sales.html',
})

export class SalesReportComponent {

    public to_date: Date;
    public from_date: Date;
    public err_message: string;
    public print_disabled: boolean = false;
    public res_pending: boolean;
    public filter: any = {};
    public isClear: boolean = false;
    dataList: Array<any> = [];
    show_image: boolean = true;
    itemSearchTerm$ = new Subject<string>();
    repost_data: any = [];
    public summary: any = {};


    constructor(private reportService: ReportService, private router: Router) { }

    ngOnInit() {
        this.filter.is_daily = true;
        this.reportService.getItemSearched(this.itemSearchTerm$)
            .subscribe(results => {
                this.dataList = results.product;
            });
        this.initSummary();
    }

    changeType(type, nType) {
        this.filter[type] = true;
        this.filter[nType] = false;
    }

    getSelectedItem(data) {
        this.filter.product = data._id;
    }

    initSummary() {
        this.summary = {
            carrier_cost: 0,
            delivery_charge: 0,
            discount: 0,
            order_price: 0,
            order_book: 0,
            total_order: 0,
            wrapping_charge: 0,
            net: 0
        };
    }

    submitReportdata() {
        this.initSummary();
        this.reportService.getStoreSales(this.filter).subscribe(output => {
            var d = new Date();
            var n = d.toISOString();
            output.duration.push(n);
            if (this.filter.is_daily) {
                let customer_orders = this.getArrangeDateData(output.result);
                let finalData = output.duration.map(day => {
                    return this.getDataOfDate(day.split("T")[0], customer_orders);
                })
                this.repost_data = finalData;
            } else {
                let customer_orders = this.getArrangeMonthData(output.result);
                let monthArray = output.duration.map(day => {
                    let date = day.split("T")[0].split("-");
                    let month = date[0] + "-" + date[1];
                    return month;
                })
                let uniqMonths = monthArray.filter((it, i, ar) => ar.indexOf(it) === i)
                let finalData = uniqMonths.map(month => {
                    return this.getDataOfDate(month, customer_orders);
                })
                this.repost_data = finalData;
            }
        })
    }

    getDataOfDate(date, coData) {
        let data: any = { date: date };
        let co = coData.find(dt => { return date == dt.date });
        data.customer_orders = {
            carrier_cost: co ? co.carrier_cost : 0,
            delivery_charge: co ? co.delivery_charge : 0,
            discount: co ? co.discount : 0,
            order_price: co ? co.order_price : 0,
            order_book: co ? co.order_book : 0,
            total_order: co ? co.total_order : 0,
            wrapping_charge: co ? co.wrapping_charge : 0,
            net: co ? this.filter.product ? co.order_price : (co.order_price + co.delivery_charge + co.wrapping_charge - co.discount - co.carrier_cost) : 0
        }

        this.summary.carrier_cost += data.customer_orders.carrier_cost;
        this.summary.delivery_charge += data.customer_orders.delivery_charge;
        this.summary.discount += data.customer_orders.discount;
        this.summary.order_price += data.customer_orders.order_price;
        this.summary.order_book += data.customer_orders.order_book;
        this.summary.wrapping_charge += data.customer_orders.wrapping_charge;
        this.summary.total_order += data.customer_orders.total_order;
        this.summary.net += data.customer_orders.net;
        return data;
    }

    getArrangeDateData(data) {
        let result = data.map(cOrder => {
            return {
                date: cOrder._id.year + "-" + (cOrder._id.month < 10 ? "0" + cOrder._id.month : cOrder._id.month) + "-" + (cOrder._id.day < 10 ? "0" + cOrder._id.day : cOrder._id.day),
                carrier_cost: cOrder.carrier_cost,
                delivery_charge: cOrder.delivery_charge,
                discount: cOrder.discount,
                order_price: cOrder.order_price,
                order_book: cOrder.order_book,
                total_order: cOrder.total_order,
                wrapping_charge: cOrder.wrapping_charge
            }
        })
        return result;
    }

    getArrangeMonthData(data) {
        let result = data.map(cOrder => {
            return {
                date: cOrder._id.year + "-" + (cOrder._id.month < 10 ? "0" + cOrder._id.month : cOrder._id.month),
                carrier_cost: cOrder.carrier_cost,
                delivery_charge: cOrder.delivery_charge,
                discount: cOrder.discount,
                order_price: cOrder.order_price,
                order_book: cOrder.order_book,
                total_order: cOrder.total_order,
                wrapping_charge: cOrder.wrapping_charge
            }
        })
        return result;
    }


    reset() {
        this.repost_data = [];
        this.to_date = undefined;
        this.from_date = undefined;
        this.print_disabled = false;
        this.isClear = true;
        setTimeout(() => {
            this.isClear = false;
        }, 500)
        this.filter = { is_daily: true };
    }


    print(): void {
        let printContents, popupWin;
        printContents = document.getElementById('print-section').innerHTML;
        popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
        popupWin.document.open();
        popupWin.document.write(`
      <html>
        <head>
          <style>
              @media print
                {     
                    table{ width:100%;}
                    .table-id{width:3%;}
                    .report-code{width:11%;}
                    .report-name{width:12%;}
                    .report-rat{width:12%;}
                    .report-quenty{width:25%;}
                    .report-price{width:10%;}
                    .report-total_amount{width:25%;}
                    .report_header h3{ text-align:center;}
                    .payment-head-img{ width:50%;}
                    .payment-head-content{ width:50%; text-align:right;}
                    .purched_mode_border{border:1px solid #ccc; padding-left:10px;}
                }

              table{ width:100%;}
              .table-hover{}
              .table-hover tr th{text-align:left;border-bottom:1px solid #ccc; border-top:1px solid #ccc; padding-top:8px; padding-bottom:8px;}
              .table-hover tr td{border-bottom:1px solid #ccc; padding-top:8px; padding-bottom:8px;}
              .payment-head-img{ width:50%;}
              .payment-head-content{ width:50%; text-align:right;}
              .table thead tr th { text-align: center; }
              .table tbody tr td { text-align: center; }
          </style>
        </head>
    <body onload="window.print();window.close()">${printContents}</body>
      </html>`
        );
        popupWin.document.close();
    }

    getToDate(event) {
        this.to_date = event.dt;
    }

    getFromDate(event) {
        this.from_date = event.dt;
    }

}