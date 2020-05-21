import { Component, ViewEncapsulation, ViewChild } from "@angular/core";
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';

import { SupplierService } from "./supplier.service";
import 'style-loader!./supplier.scss';

@Component({
    selector: 'supplier-edit',
    templateUrl: './supplier.edit.html',
    styleUrls: ['./supplier.scss'],
})
export class SupplierEditComponent {

    public supplier: any = {};
    public id: string;
    public alerts: any = [];
    public isDisabled: boolean;
    public isSubmited: boolean;
    public areas: any = [];


    constructor(private supplierService: SupplierService, private route: ActivatedRoute, private location: Location) { }

    ngOnInit() {
        this.id = this.route.snapshot.params['id'];
        this.getAreas();
        this.supplierService.get(this.id).subscribe(result => {
            if (result.success) {
                this.supplier = result.data;
            }
        })
    }

    getAreas(){
        this.supplierService.getArea().subscribe(result=>{
          this.areas=result;
        })
      }

    updateSupplier() {
        this.isSubmited = true;
        this.isDisabled = true;
        if (this.supplier.name && this.supplier.name != '' && this.supplier.address && this.supplier.address != '') {
            this.supplierService.update(this.supplier).subscribe(result => {
                if (result.success) {
                    setTimeout((router: Router) => {
                        this.location.back();
                        this.isDisabled = false;
                    }, 2000);
                    this.alerts.push({
                        type: 'info',
                        msg: 'Supplier update successfully ',
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