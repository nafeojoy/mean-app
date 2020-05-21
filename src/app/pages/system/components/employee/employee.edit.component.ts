import { Component, ViewEncapsulation, ViewChild } from "@angular/core";
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';

import { EmployeeService } from "./employee.service";
import 'style-loader!./employee.scss';

@Component({
    selector: 'employee-edit',
    templateUrl: './employee.edit.html',
    styleUrls: ['./employee.scss'],
})
export class EmployeeEditComponent {

    public employee: any = {};
    public cat_id: string;
    public alerts: any = [];
    public isDisabled: boolean;
    public isSubmited: boolean;
    public designations: Array<any> = [];


    constructor(private employeeService: EmployeeService, private route: ActivatedRoute, private location: Location) { }

    ngOnInit() {
        this.designations = [
            { name: "Customer Care Manager", value: 'customer_care_manager' },
            { name: "Sourching Manager", value: 'sourching_manager' },
            { name: "Purchase Manager", value: 'purchase_manager' },
            { name: "Dispatch Manager", value: 'dispatch_manager' }
        ]
        this.cat_id = this.route.snapshot.params['id'];
        this.employeeService.get(this.cat_id).subscribe(result => {
            if (result._id) {
                this.employee = result;
            }
        })
    }

    updateEmployee() {
        this.isSubmited = true;
        this.isDisabled = true;
        if (this.employee.name && this.employee.name != '' && this.employee.phone && this.employee.phone != '' && this.employee.employee_id && this.employee.employee_id != '' && this.employee.email && this.employee.email != '') {
            this.employeeService.update(this.employee).subscribe(result => {
                if (result.success) {
                    setTimeout((router: Router) => {
                        this.location.back();
                        this.isDisabled = false;
                    }, 2000);
                    this.alerts.push({
                        type: 'info',
                        msg: 'Employee update successfully ',
                        timeout: 4000
                    });

                } else {
                    this.isDisabled = false;
                    this.alerts.push({
                        type: 'danger',
                        msg: 'Something went wrong. Try Again',
                        timeout: 4000
                    });
                }
            })
        } else {
            this.isDisabled = false;
            this.isSubmited = true;
        }
    }

    back() {
        this.location.back();
    }

}