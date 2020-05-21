import { Component, ViewEncapsulation } from "@angular/core";
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/mergeMap';
import { ProductService } from "./products.service";
import { CategoryService } from "../categories/category.service";
import { AuthManager } from "../../../../authManager";
import { ExcelService } from '../../../../shared/services/excel-export.service';

import { PaginationSearchBase } from '../../../../shared/classes/pagination-search-base';

import 'style-loader!./products.scss';

@Component({
  selector: 'products-list',
  templateUrl: './products.list.html',
})

export class ProductListComponent {
  public apiBaseUrl: string;
  public products: any = [];
  public totalItems: number = 0;
  public currentPage: number = 1;
  public maxSize: number = 5;
  itemsPerPage: number = 10;
  res_pending: boolean;
  range: any = { from: 0 };
  searchCriterion: any = {};
  res_pending_dwln: boolean;
  is_download_able:boolean;

  constructor(private _excelService: ExcelService, private productService: ProductService, private categoryService: CategoryService, public authManager: AuthManager) {

  }

  ngOnInit() {
    this.getInitProduct(this.currentPage);
    for (var key in localStorage) {
      if (key.length == 24) {
        localStorage.removeItem(key);
      }
    }
  }

  getInitProduct(currentPage) {
    this.productService.getAllProduct(currentPage).subscribe(result => {
      this.products = result.items;
      this.totalItems = result.count;
    })
  }

  searchProduct(criterion) {
    this.is_download_able=false;
    let validSearchObj = this.getValidCriterion(criterion);
    if (validSearchObj.book_name) {
      validSearchObj.pageNum = this.currentPage;
      this.res_pending = true;
      this.productService.getSearchNameData(validSearchObj).subscribe(result => {
        this.res_pending = false;
        this.products = result.items;
        this.totalItems = result.count;
      })
    } else {
      validSearchObj.pageNum = this.currentPage;
      this.res_pending = true;
      this.productService.getSearchOtherData(validSearchObj).subscribe(result => {
        this.res_pending = false;
        this.products = result.items;
        this.totalItems = result.count;
        if(result.count>0){
          this.is_download_able=true;
        }else{
          alert("No result found this query");
        }
      })
    }
  }

  pageChanged(pagination) {
    this.currentPage = pagination.page;
    let crtObj = this.searchCriterion;
    let vldKey = Object.keys(crtObj).filter(key => { return crtObj[key] != '' });
    if (vldKey.length > 0) {
      this.searchProduct(this.searchCriterion);
    } else {
      this.getInitProduct(this.currentPage);
    }
  }

  reset() {
    this.currentPage = 1;
    this.searchCriterion = {};
    this.getInitProduct(this.currentPage);
  }

  dataDownload() {
    let crtObj = this.searchCriterion;
    let vldKey = Object.keys(crtObj).filter(key => { return crtObj[key] != '' });
    if (vldKey.length > 0 && vldKey.indexOf('book_name') < 0) {
      this.res_pending_dwln = true;
      this.productService.getDownloadData(this.getValidCriterion(crtObj)).subscribe(result => {
        this.res_pending_dwln = false;
        if (result.success) {
          this._excelService.exportAsExcelFile(result.data, 'search_book')
        } else {
          alert("Data download failed, Please try after sometime");
        }
      })
    }
  }

  downloadImage(product){
    let strArr=product.sngImage.split('/');
    if(strArr.length>4){
      strArr[5]="image";
     let newUrl=strArr.join("/");
     window.open(`https://d1jpltibqvso3j.cloudfront.net${newUrl}`);
    }else{
      alert("No image found to download");
    }
  }

  set(data) {
    window.localStorage.setItem(data._id, JSON.stringify(data));
  }

  getValidCriterion(criterion) {
    let validSearchObj: any = {};
    Object.keys(criterion).forEach(function (key) {
      if (criterion[key] != '' || criterion[key] == 0) {
        validSearchObj[key] = criterion[key];
      }
    })
    if (!validSearchObj.discount_to || validSearchObj.discount_to == 0) {
      delete validSearchObj.discount_to;
      delete validSearchObj.discount_from;
    } else {
      validSearchObj.discount_range = {
        from: validSearchObj.discount_from ? validSearchObj.discount_from : 0,
        to: validSearchObj.discount_to
      }
      delete validSearchObj.discount_to;
      delete validSearchObj.discount_from;
    }
    if (!validSearchObj.price_to || validSearchObj.price_to == 0) {
      delete validSearchObj.price_to;
      delete validSearchObj.price_from;
    } else {
      validSearchObj.price_range = {
        from: validSearchObj.price_from ? validSearchObj.price_from : 0,
        to: validSearchObj.price_to
      }
      delete validSearchObj.price_to;
      delete validSearchObj.price_from;
    }
    return validSearchObj;
  }

}