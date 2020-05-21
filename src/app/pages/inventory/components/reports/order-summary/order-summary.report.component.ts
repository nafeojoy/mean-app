import { Component, ViewEncapsulation, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { Subject } from 'rxjs/Subject';

import { ReportService } from '../report.service';
import { DatePipe } from "@angular/common";

import 'style-loader!../report.scss';

@Component({
    selector: 'order-summary',
    templateUrl: './order-summary.report.html',
})

export class OrderSummaryComponent {


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
            Pending: 0,
            Confirmed: 0,
            Inshipment: 0,
            Delivered: 0,
            ReturnRequest: 0,
            OrderClosed: 0,
            Cancelled: 0,
            total: 0
        };
    }

    submitReportdata() {
        this.initSummary();
        this.reportService.getOrderSummary(this.filter).subscribe(output => {
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
        if (co) {
            data.customer_orders = {
                total: co.count,
                Pending: co.order.find(st => { return st.status == "Pending" }) ? co.order.find(st => { return st.status == "Pending" }).total : 0,
                Confirmed: co.order.find(st => { return st.status == "Confirmed" }) ? co.order.find(st => { return st.status == "Confirmed" }).total : 0,
                Inshipment: co.order.find(st => { return st.status == "Inshipment" }) ? co.order.find(st => { return st.status == "Inshipment" }).total : 0,
                Delivered: co.order.find(st => { return st.status == "Delivered" }) ? co.order.find(st => { return st.status == "Delivered" }).total : 0,
                ReturnRequest: co.order.find(st => { return st.status == "ReturnRequest" }) ? co.order.find(st => { return st.status == "ReturnRequest" }).total : 0,
                OrderClosed: co.order.find(st => { return st.status == "OrderClosed" }) ? co.order.find(st => { return st.status == "OrderClosed" }).total : 0,
                Cancelled: co.order.find(st => { return st.status == "Cancelled" }) ? co.order.find(st => { return st.status == "Cancelled" }).total : 0
            }
        } else {
            data.customer_orders = { total: 0, Pending: 0, Confirmed: 0, Inshipment: 0, Delivered: 0, ReturnRequest: 0, OrderClosed: 0, Cancelled: 0 }
        }

        this.summary.Pending += data.customer_orders.Pending;
        this.summary.Confirmed += data.customer_orders.Confirmed;
        this.summary.Inshipment += data.customer_orders.Inshipment;
        this.summary.Delivered += data.customer_orders.Delivered;
        this.summary.purBook += data.customer_orders.order_book;
        this.summary.ReturnRequest += data.customer_orders.ReturnRequest;
        this.summary.OrderClosed += data.customer_orders.OrderClosed;
        this.summary.Cancelled += data.customer_orders.Cancelled;
        this.summary.total += data.customer_orders.total;
        return data;
    }

    getArrangeDateData(data) {
        let result = data.map(cOrder => {
            return {
                date: cOrder._id.year + "-" + (cOrder._id.month < 10 ? "0" + cOrder._id.month : cOrder._id.month) + "-" + (cOrder._id.day < 10 ? "0" + cOrder._id.day : cOrder._id.day),
                count: cOrder.count,
                order: cOrder.order,
            }
        })
        return result;
    }

    getArrangeMonthData(data) {
        let result = data.map(cOrder => {
            return {
                date: cOrder._id.year + "-" + (cOrder._id.month < 10 ? "0" + cOrder._id.month : cOrder._id.month),
                count: cOrder.count,
                order: cOrder.order,
            }
        })
        return result;
    }


    reset() {
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