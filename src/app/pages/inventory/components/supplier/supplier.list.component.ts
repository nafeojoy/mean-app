import { Component, ViewEncapsulation } from "@angular/core";

import { SupplierService } from "./supplier.service";
import 'style-loader!./supplier.scss';

@Component({
    selector: 'supplier-list',
    templateUrl: './supplier.list.html'
})

export class SupplierListComponent {

    public suppliers: any = [];
    public totalItems: number;
    public currentPage: number = 1;
    public maxSize: number = 5;
    public waiting: boolean;
    public searchCriterion: any = {};
    public areas: any = [];
    public res_pending: boolean;

    constructor(private supplierService: SupplierService) {

    }

    ngOnInit() {
        this.getAreas();
        this.searchCriterion.pageNo = this.currentPage;
        this.getSuppliers(this.searchCriterion);
    }

    getAreas() {
        this.supplierService.getArea().subscribe(result => {
            this.areas = result;
        })
    }

    getSuppliers(search) {
        this.res_pending = true;
        this.supplierService.getAll(search).subscribe(result => {
            this.res_pending = false;
            if (result.success) {
                this.suppliers = result.data;
                this.totalItems = result.count;
            }
        })
    }

    setPage(pageNum): void {
        this.currentPage = pageNum;
        this.searchCriterion.pageNo = this.currentPage;
        this.getSuppliers(this.searchCriterion);
    }

    searchProduct() {
        this.currentPage = 1;
        this.searchCriterion.pageNo = this.currentPage;
        this.getSuppliers(this.searchCriterion);
    }

    resetSearch() {
        this.currentPage = 1;
        this.searchCriterion = {};
        this.searchCriterion.pageNo = this.currentPage;
        this.getSuppliers(this.searchCriterion);
    }


}
