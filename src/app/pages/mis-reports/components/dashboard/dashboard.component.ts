import { Component, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';

import { DashboardService } from "./dashboard.service";
import { chart } from 'highcharts';
import {
    getSalesChartData,
    getOrderSummaryBarChartData,
    getSalesPurchaseSummaryBarChartData
} from './chartData';

import "style-loader!./datepick.css"

@Component({
    selector: 'dashboard-up',
    templateUrl: './dashboard.html',
    styleUrls: ['./dashboard.scss']
})

export class DashboardUIComponent {
    public dash_data: any = {};
    @ViewChild('salesBarchartTarget') salesBarchartTarget: ElementRef;
    @ViewChild('orderSummaryBarChartTarget') orderSummaryBarChart: ElementRef;
    @ViewChild('salesPurchaseSummaryBarChartTarget') salesPurchaseSummaryBarChart: ElementRef;

    salesChart: Highcharts.ChartObject;
    orderSummaryChart: Highcharts.ChartObject;
    salesPurchaseSummaryChart: Highcharts.ChartObject;


    daily_purchase_data: any = {}
    visit_and_order_info: any = {};
    order_summary: any = [];
    quick_view_obj: any = {};
    order_process_and_customer_info: any = {};
    selected_date:any={}

    total_current_cost: number = 0;
    total_prior_cost: number = 0;

    total_current_gain: number = 0;
    total_prior_gain: number = 0;
    dtRange: any = {};

    constructor(private _dashboardService: DashboardService) {

    }
    ngOnInit() {
        this._dashboardService.getDashboardInitData().subscribe(result => {
            this.getSelectedDateRange(result[2].all_days);
            this.visit_and_order_info = result[0];
            this.order_summary = this.createdOrderData(result[0]);
            this.createOrderSummary(result[0].curr_order_statistics);
            this.createSalesPurchaseSummary(result[1]);
            this.quick_view_obj = result[1];
            this.calculatereceivedAndGain();
            this.dailySalesPurchaseData(result[2]);
            this.order_process_and_customer_info = result[3]
        })
    }

    getSelectedDateRange(dates){
        this.selected_date.from=new Date(dates[0]);
        this.selected_date.to=new Date(dates[dates.length-1]);
    }

    dateChanged() {
        this._dashboardService.getWithDateRange(this.getDateRangeObject(this.dtRange)).subscribe(result => {
            this.getSelectedDateRange(result[2].all_days);
            this.visit_and_order_info = result[0];
            this.order_summary = this.createdOrderData(result[0]);
            this.createOrderSummary(result[0].curr_order_statistics);
            this.createSalesPurchaseSummary(result[1]);
            this.quick_view_obj = result[1];
            this.calculatereceivedAndGain();
            this.dailySalesPurchaseData(result[2]);
            this.order_process_and_customer_info = result[3]
        }, error=>{
            console.log(error);
        })
    }

    getDateRangeObject(dateArray) {
        let from_date = new Date(dateArray[0]);
        let to_date = new Date(dateArray[1]);
        return {
            from_date: `${from_date.getFullYear()}-${from_date.getMonth() + 1}-${from_date.getDate()}`,
            to_date: `${to_date.getFullYear()}-${to_date.getMonth() + 1}-${to_date.getDate()}`
        }
    }

    createOrderSummary(order_statuses) {
        let barChartSeries = order_statuses.map(ordr => {
            return { name: ordr._id, data: [ordr.count] };
        })
        this.orderSummaryChart = chart(this.orderSummaryBarChart.nativeElement, getOrderSummaryBarChartData({ series: barChartSeries }));
    }

    createSalesPurchaseSummary(sellpur_data: any) {
        let barChartSeries = [
            { name: "Sales", label: `(${sellpur_data.current_sales_data.customer_order} Orders, ${sellpur_data.current_sales_data.total_book} Books)`, data: [sellpur_data.current_sales_data.total_sales] },
            { name: "Purchase Price", label: `(${sellpur_data.curr_purchase_statistics.total_book} Book)`, data: [sellpur_data.curr_purchase_statistics.total_purchase_cost] }
        ]
        this.salesPurchaseSummaryChart = chart(this.salesPurchaseSummaryBarChart.nativeElement, getSalesPurchaseSummaryBarChartData({ series: barChartSeries }));
    }

    calculatereceivedAndGain() {
        this.total_current_cost = 0;
        this.total_prior_cost = 0;
        this.total_current_gain = 0;
        this.total_prior_gain = 0;

        this.total_current_cost += this.quick_view_obj.current_sales_data && this.quick_view_obj.current_sales_data.carrier_cost ? this.quick_view_obj.current_sales_data.carrier_cost : 0;
        this.total_current_cost += this.quick_view_obj.current_sales_data && this.quick_view_obj.current_sales_data.transaction_cost ? this.quick_view_obj.current_sales_data.transaction_cost : 0;
        this.total_current_cost += this.quick_view_obj.current_sales_data && this.quick_view_obj.current_sales_data.return_cost ? this.quick_view_obj.current_sales_data.return_cost : 0;

        this.total_prior_cost += this.quick_view_obj.proir_sales_data && this.quick_view_obj.proir_sales_data.carrier_cost ? this.quick_view_obj.proir_sales_data.carrier_cost : 0;
        this.total_prior_cost += this.quick_view_obj.proir_sales_data && this.quick_view_obj.proir_sales_data.transaction_cost ? this.quick_view_obj.proir_sales_data.transaction_cost : 0;
        this.total_prior_cost += this.quick_view_obj.proir_sales_data && this.quick_view_obj.proir_sales_data.return_cost ? this.quick_view_obj.proir_sales_data.return_cost : 0;

        this.total_current_gain += this.quick_view_obj.current_sales_data.total_sales - (this.total_current_cost + this.quick_view_obj.curr_purchase_statistics.total_purchase_cost);
        this.total_prior_gain += this.quick_view_obj.proir_sales_data.total_sales - (this.quick_view_obj.prior_purchase_statistics.total_purchase_cost);
    }

    dailySalesPurchaseData(data) {
        let daily_purchase = data.daily_purchase.map(dt => { return { purchase_cost: dt.purchase_cost, purchase_date: `${dt._id.year}-${dt._id.month}-${dt._id.day}` } })
        let daily_sales = data.daily_sales;
        let varXaxisData = data.all_days;
        let sales_series = [];
        let purchase_series = [];
        varXaxisData.map(xAxis => {
            let ss = daily_sales.find(sell => { return sell._id == xAxis });
            let sp = daily_purchase.find(pur => { return pur.purchase_date == xAxis });
            if (ss) {
                sales_series.push(ss.total_sales);
            } else {
                sales_series.push(0);
            }
            if (sp) {
                purchase_series.push(sp.purchase_cost);
            } else {
                purchase_series.push(0);
            }
        })
        this.salesChart = chart(this.salesBarchartTarget.nativeElement, getSalesChartData({ varXaxisData: varXaxisData, sales: sales_series, purchase: purchase_series }));
    }

    createdOrderData(data) {
        let total_order = { status_name: 'Total Order', current_qty: 0, prior_qty: 0 }
        let total_order_value = { status_name: 'Order Value', current_qty: 0, prior_qty: 0 }
        let total_book_value = { status_name: 'No of Books', current_qty: 0, prior_qty: 0 }

        let data_list = data.curr_order_statistics.map(curr_obj => {
            let prior_obj = data.prior_order_statistics.find(pst => { return pst._id == curr_obj._id })
            let status_obj = {
                status_name: curr_obj._id,
                current_qty: curr_obj.count,
                prior_qty: prior_obj ? prior_obj.count : 0
            }
            total_order.current_qty += curr_obj.count;
            total_order.prior_qty += prior_obj ? prior_obj.count : 0;

            total_order_value.current_qty += curr_obj.total_order_value;
            total_order_value.prior_qty += prior_obj ? prior_obj.total_order_value : 0;

            total_book_value.current_qty += curr_obj.total_book;
            total_book_value.prior_qty += prior_obj ? prior_obj.total_book : 0;

            return status_obj;
        })
        data_list.unshift(total_order);
        data_list.push(total_order_value);
        data_list.push(total_book_value);
        return data_list;
    }

}