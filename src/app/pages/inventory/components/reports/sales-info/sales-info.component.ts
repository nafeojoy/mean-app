import { Component, ViewEncapsulation, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { ReportService } from '../report.service';
import 'style-loader!../report.scss';
import { ModalDirective } from 'ngx-bootstrap';

@Component({
    selector: 'sales-info-report',
    templateUrl: './sales-info.html',
})

export class SalesInfoReportComponent {

    public err_message: string;
    public print_disabled: boolean = false;
    public res_pending: boolean;
    report_data: any = [];
    report_detail_data: any = [];
    filter: any = {};
    selectedDateStr: string;
    public total: any = { received: 0, book: 0, due: 0, sales: 0, order: 0 }

    public sales_summary: any = {};

    @ViewChild('salesdetailModal') salesdetailModal: ModalDirective;

    constructor(private reportService: ReportService, private router: Router) { }

    ngOnInit() {

    }

    submitReportdata() {
        this.total.received = 0;
        this.total.sales = 0;
        this.total.due = 0;
        this.total.book = 0;
        this.total.order = 0;
        this.reportService.getDailySalesInfo(this.filter).subscribe(result => {
            this.report_data = result;
            result.map(rslt => {
                this.total.sales += rslt.payable_amount;
                this.total.book += rslt.total_book;
                this.total.order += rslt.total_order;
                this.total.received += rslt.recieved_amount;
                this.total.due += (rslt.payable_amount - rslt.recieved_amount);
            })
        })
    }

    rowSelected(id) {
        // this.router.navigateByUrl(`/pages/inventory/report/sales-report/${id.year}-${id.month}-${id.day}`);
        this.selectedDateStr = id;
        let date = id;
        this.sales_summary = { total_book: 0, total_order: 0, total_payable: 0, total_paid: 0, total_due: 0 };
        this.reportService.getSaleDetails(date).subscribe(result => {
            result.map(rslt => {
                this.sales_summary.total_book += rslt.total_book;
                this.sales_summary.total_order += 1;
                this.sales_summary.total_payable += rslt.payable_amount;
                let paid = rslt.payment_collection && rslt.payment_collection.total_paid ? rslt.payment_collection.total_paid : 0;
                this.sales_summary.total_paid += paid;
                this.sales_summary.total_due = this.sales_summary.total_payable - this.sales_summary.total_paid;
            })
            this.report_detail_data = result;
            this.salesdetailModal.show();
        })
    }

    reset() {
        this.report_data = [];
        this.print_disabled = false;
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
							table{
								width:100%;
								font-size: 10px !important;
							}
							.sales-summary table tbody tr td{
								padding: 0px 0px !important;
								line-height: 26px !important;
								border-bottom:0.5px dotted #ccc !important;
							}
						}
				</style>
			</head>
	<body onload="window.print();window.close()">${printContents}</body>
		</html>`
        );
        popupWin.document.close();
    }


    printDetail(): void {
        let printContents, popupWin;
        printContents = document.getElementById('detail-print-section').innerHTML;
        popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
        popupWin.document.open();
        popupWin.document.write(`
		<html>
			<head>
				<style>
					@media print
						{
							table{
								width:100%;
							}
							.sales-order-detail table tbody tr td{
								border-bottom:0.5px dotted #ccc !important;
							}
							.order-detail tr{
								border-bottom: 1px solid !important;
								border-color: rgba(128, 128, 128, 0.30196078431372547);
							}

							.sales-order-detail table tbody tr td{
								padding: 0px 0px !important;
								line-height: 26px !important;
								font-size: 10px !important;
							}

							.sales-order-detail table thead tr th{
								font-size: 10px !important;
							}
							.sales-order-detail table thead tr{
								background-color: #ccc;
							}
						}
				</style>
			</head>
			<body onload="window.print();window.close()">
				${printContents}
			</body>
		</html>`
        );
        popupWin.document.close();
    }

}
