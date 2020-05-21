import { Component, ViewEncapsulation, ViewChild } from '@angular/core';

import { VisitorsReportService } from "./visitors-report.service";
import { TabsetComponent } from 'ng2-bootstrap';
import 'style-loader!./visitors-report.scss';

@Component({
    selector: 'visitors-report',
    templateUrl: './visitors-report.html',
})

export class VisitorsReportComponent {

    public alerts: any = [];
    public totalItems: number = 0;
    public total_visited: number = 0;
    public currentPage: number = 1;
    public to_date = Date;
    public from_date: Date;
    public res_pending: boolean;
    public visitors: any = [];

    constructor(private visitorsReportService: VisitorsReportService) {

    }

    ngOnInit() {

    }

    getData() {
        this.res_pending = true;
        let params: any = new Object();
        if (this.from_date && this.to_date) {
            params = { from_date: this.from_date, to_date: this.to_date };
        }
        params.pageNum = this.currentPage;
        this.visitorsReportService.getData(params).subscribe(result => {
            this.res_pending = false;
            if (result.success) {
                this.total_visited = result.total_visited;
                this.visitors = result.data;
                this.totalItems = result.count;
            } else {
                this.currentPage = 1;
                this.visitors = [];
                this.total_visited = 0;
                this.visitors = 0;
                this.totalItems = 0;
                this.alerts.push({
                    type: 'danger',
                    msg: "No data found with this criteria",
                    timeout: 4000
                });
            }
        })
    }

    getToDate(event) {
        this.to_date = event.dt;
    }

    getFromDate(event) {
        this.from_date = event.dt;
    }

    reset() {
        this.from_date = undefined;
        this.to_date = undefined;
        this.currentPage = 1;
        this.visitors = [];
    }

    public setPage(pageNo: number): void {
        this.currentPage = pageNo;
        this.getData();
    }


}