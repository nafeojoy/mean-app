import { Component, ViewEncapsulation, ViewChild } from "@angular/core";
import { Location } from "@angular/common";
import { ModalDirective } from 'ng2-bootstrap';
import { ProductAnalysisService } from "./product-analysis.service";
import { PurchaseOrderService } from "../putchase-order.service";
import { Subject } from 'rxjs';

@Component({
    selector: 'product-analysis',
    templateUrl: './product-analysis.html',
    styleUrls: ['./product-analysis.scss']
})
export class ProductAnalysisComponent {
  
    public productData: any = [];
    public totalItems: number;
    public currentPage: number = 1;
    public maxSize: number = 30;
    public i: number;
    public importId: any;
    public searchedData: any = [];
    public importIdOrSeoId: any;
    public counSearch: any;
   
    @ViewChild('receiptModal') receiptModal: ModalDirective;

    constructor(private location: Location, private productAnalysis: ProductAnalysisService) { }

    ngOnInit() {
        this.getAnalysiedData();
    }

    getAnalysiedData(){
        this.productAnalysis.getProductDetails().subscribe((result) => {
                this.productData = result.analysis_data;
                this.totalItems = result.count; 
        })
    }

    searchEvent(e){
        let stainth = e.target.value;
        if(stainth.length >= 1){
          this.counSearch = "exist";     
        }
        else if(stainth.length < 1){
          this.counSearch = "notExist";
        }
    }

    getProductBySearch(){
        this.productAnalysis.getSearchedProduct(this.importIdOrSeoId)
            .subscribe(results => {
                this.searchedData = results.data;
            });
    }

}