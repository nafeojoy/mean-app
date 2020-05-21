import { NgModule, ApplicationRef } from '@angular/core';

import { routing } from './product.details.routing';
import { SharedModule } from "../shared/shared.module";

import { ProductDetailComponent } from "./product.details.component";
import { AuthorDetailsComponent } from "./components/author-details";
import { CustomerReviewComponent, CustomerReviewService } from "./components/customer-review";
import { ProductSpecificationComponent } from "./components/product-specification";
import { ProductBreadcrumbComponent } from "./components/product-breadcrumb";
import { SimilarProductsComponent } from "./components/similar-products";

@NgModule({
  declarations: [
    ProductDetailComponent,
    AuthorDetailsComponent,
    CustomerReviewComponent,
    ProductBreadcrumbComponent,
    ProductSpecificationComponent,
    SimilarProductsComponent,
  ],
  imports: [
    routing,
    SharedModule
  ],
  providers: [CustomerReviewService],
  exports: []
})

export class ProductDetailsModule { }