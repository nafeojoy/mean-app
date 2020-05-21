import { Component, ViewEncapsulation, ViewChild } from "@angular/core";
import { ProductService } from "./products.service";
import { AuthManager } from "../../../../authManager";
import { NgxGalleryOptions, NgxGalleryImage, NgxGalleryAnimation } from 'ngx-gallery';

import 'style-loader!./products.scss';
import { ModalDirective } from 'ngx-bootstrap';

@Component({
  selector: 'products-list',
  templateUrl: './products.list.html',
})

export class ProductListComponent {
  @ViewChild('viewModal') viewModal: ModalDirective;

  public apiBaseUrl: string;
  public products: Array<any> = [];
  public totalItems: number = 0;
  public currentPage: number = 1;
  public maxSize: number = 5;
  public itemsPerPage: number = 10;
  selectedProduct: any = {};

  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[] = [];
  public product_detail: any = {};

  constructor(private productService: ProductService, public authManager: AuthManager) {

  }

  ngOnInit() {
    this.getItems();
    this.galleryOptions = [
      {
        width: '600px',
        height: '400px',
        thumbnailsColumns: 4,
        imageAnimation: NgxGalleryAnimation.Slide
      },
      {
        breakpoint: 800,
        width: '100%',
        height: '600px',
        imagePercent: 80,
        thumbnailsPercent: 20,
        thumbnailsMargin: 20,
        thumbnailMargin: 20
      },
      {
        breakpoint: 400,
        preview: false
      }
    ];
  }

  getItems() {
    this.productService.get(this.currentPage).subscribe(result => {
      if (result.count) {
        this.products = result.products;
        this.totalItems = result.count;
      } else {
        this.products = [];
        this.totalItems = 0;
      }
    })
  }

  pageChanged(page_info) {
    this.currentPage = page_info.page;
    this.getItems();
  }

  showViewModal(id) {
    this.galleryImages = [];
    this.productService.getDetail(id).subscribe(result => {
      if (result.success) {
        let product = result.data;
        this.product_detail = product;
        if (product.image && product.image['250X360']) {
          this.galleryImages.push({
            small: `https://d1jpltibqvso3j.cloudfront.net${product.image['120X175']}`,
            medium: `https://d1jpltibqvso3j.cloudfront.net${product.image['250X360']}`
          })
        }
        if (product.preview_images.length > 0) {
          product.preview_images.map(prv_img => {
            this.galleryImages.push({
              small: `https://d1jpltibqvso3j.cloudfront.net${prv_img.image['650X800']}`,
              medium: `https://d1jpltibqvso3j.cloudfront.net${prv_img.image['1200X1600']}`
            })
          })
        }
        if (product.back_cover_image && product.back_cover_image['250X360']) {
          this.galleryImages.push({
            small: `https://d1jpltibqvso3j.cloudfront.net${product.back_cover_image['120X175']}`,
            medium: `https://d1jpltibqvso3j.cloudfront.net${product.back_cover_image['250X360']}`
          })
        }
        this.viewModal.show();
      }
    })
  }

  showConfirmModal(id, action) {
    let message=`Are you sure to ${action=='accept'? 'Approve':'Reject'}?`
    let sure = confirm(message);
    if (sure) {
      this.productService.approve(id, action).subscribe(result => {
        if (result.success) {
          this.viewModal.hide();
          this.getItems();
        }
      })
    }else{
      this.viewModal.hide();
    }
  }


}