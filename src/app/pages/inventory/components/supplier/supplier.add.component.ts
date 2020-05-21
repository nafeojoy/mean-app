import { Component, ViewEncapsulation, ViewChild } from "@angular/core";
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';

import { SupplierService } from "./supplier.service";
import 'style-loader!./supplier.scss';

@Component({
  selector: 'supplier-add',
  templateUrl: './supplier.add.html',
  styleUrls: ['./supplier.scss'],
})
export class SupplierAddComponent {

  public supplier: any = {};
  public alerts: any = [];
  public isDisabled: boolean = false;
  public isSubmited: boolean;
  public areas:any=[];

  constructor(private supplierService: SupplierService, private route: ActivatedRoute, private location: Location) { }

  ngOnInit() {
    this.supplier.is_enabled = true;
    this.getAreas();
  }

  getAreas(){
    this.supplierService.getArea().subscribe(result=>{
      this.areas=result;
    })
  }

  addSupplier() {
    this.isDisabled = true;
    this.isSubmited = true;
    if (this.supplier.name && this.supplier.name != '' && this.supplier.address && this.supplier.address != '' && this.supplier.area) {
      this.supplierService.add(this.supplier).subscribe(result => {
        if (result.success) {
          this.isSubmited = false;
          this.supplier = { is_enabled: true };
          setTimeout((router: Router) => {
            this.location.back();
            this.isDisabled = false;
          }, 2000);
          this.alerts.push({
            type: 'info',
            msg: 'New Supplier add ',
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