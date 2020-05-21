import { Component, ViewEncapsulation } from "@angular/core";

import { QueryService } from "./customer-query.service";
import 'style-loader!./customer-query.scss';

@Component({
    selector: 'query-add',
    templateUrl: './customer-query.add.html'
})

export class QueryAddComponent {
    // Book Query
    public query: any = {};
    public query_message: string;
    public showForm: boolean;
    public validation: any = {};
    public alerts = [];


    constructor(private _queryService: QueryService) { }

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
        query.from = 'Facebook';
        this._queryService.add(query).subscribe(result => {
            if (result.success) {
                this.query = {};
                this.alerts.push({
                    type: 'info',
                    msg: "Submitted successfully!",
                    timeout: 2000
                });
            } else {
                this.alerts.push({
                    type: 'danger',
                    msg: "Query submit failed!",
                    timeout: 2000
                });
            }
        })
    }
}