import { Component, ViewEncapsulation } from "@angular/core";

import { EmployeeService } from "./employee.service";
import 'style-loader!./employee.scss';

@Component({
    selector: 'employee-list',
    templateUrl: './employee.list.html'
})

export class EmployeeListComponent {

    public totalItems: number;
    public currentPage: number = 1;
    public maxSize: number = 5;
    public employees: any = [];
    public designations: Array<any> = [];

    constructor(private employeeService: EmployeeService) {

    }

    ngOnInit() {
        this.getData(this.currentPage);
        this.designations = [
            { name: "Customer Care Manager", value: 'customer_care_manager' },
            { name: "Sourching Manager", value: 'sourching_manager' },
            { name: "Purchase Manager", value: 'purchase_manager' },
            { name: "Dispatch Manager", value: 'dispatch_manager' }
        ]
    }

    getData(pageNo) {
        this.employeeService.getAll(pageNo).subscribe(result => {
            this.employees = result.data.map(dt => {
                let d_obj = this.designations.find(desig => { return desig.value == dt.designation });
                dt.designation = d_obj ? d_obj.name : '';
                return dt;
            });
            this.totalItems = result.count;
        })
    }

    setPage(pageNum): void {
        this.currentPage = pageNum;
        this.getData(this.currentPage);
    }

}
