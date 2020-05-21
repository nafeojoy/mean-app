import { NgModule, ApplicationRef } from '@angular/core';

import { routing } from './products.routing';

import { SharedModule } from "../shared/shared.module";

import { ProductsComponent } from "./products.component";
import { ProductsBreadcrumbComponent } from "./components/products-breadcrumb";
import { ProductsFilterComponent } from "./components/products-filter";
import { ProductsSummaryComponent } from "./components/products-summary";


@NgModule({
  declarations: [
    ProductsComponent,
    ProductsBreadcrumbComponent,
    ProductsFilterComponent,
    ProductsSummaryComponent,
  ],
  imports: [
    routing,
    SharedModule
  ],
  providers: [],
  exports: []
})

export class ProductsModule { }