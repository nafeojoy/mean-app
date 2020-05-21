import { Component, ViewEncapsulation, ViewChild } from "@angular/core";
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';

import { EmployeeService } from "./employee.service";
import 'style-loader!./employee.scss';

@Component({
  selector: 'employee-add',
  templateUrl: './employee.add.html',
  styleUrls: ['./employee.scss'],
})
export class EmployeeAddComponent {

  public employee: any = {};
  public alerts: any = [];
  public isDisabled: boolean = false;
  public isSubmited: boolean;

  public designations: Array<any> = [];

  constructor(private employeeService: EmployeeService, private route: ActivatedRoute, private location: Location) { }

  ngOnInit() {
    this.employee.is_enabled = true;
    this.designations = [
      { name: "Customer Care Manager", value: 'customer_care_manager' },
      { name: "Sourching Manager", value: 'sourching_manager' },
      { name: "Purchase Manager", value: 'purchase_manager' },
      { name: "Dispatch Manager", value: 'dispatch_manager' }
    ]
  }


  addEmployee() {
    this.isDisabled = true;
    this.isSubmited = true;
    if (this.employee.name && this.employee.name != '' && this.employee.designation && this.employee.phone && this.employee.phone != '' && this.employee.employee_id && this.employee.employee_id != '' && this.employee.email && this.employee.email != '') {
      this.employeeService.add(this.employee).subscribe(result => {
        if (result.success) {
          this.isSubmited = false;
          this.employee = { is_enabled: true };
          setTimeout((router: Router) => {
            this.location.back();
            this.isDisabled = false;
          }, 2000);
          this.alerts.push({
            type: 'info',
            msg: 'New Employee add ',
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