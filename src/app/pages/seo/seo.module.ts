import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgaModule } from '../../theme/nga.module';
import { SharedModule } from '../../shared/shared.module';
import { routing } from "./seo.routing";
import { ModalModule, TypeaheadModule, PaginationModule } from "ngx-bootstrap";
import { AuthManager } from "../../authManager";
import { SeoComponent } from "./seo.component";

import { ProductListComponent, ProductModelService, ProductEditComponent, ProductService } from "./components/products";
import { AuthorListComponent, AuthorModelService, AuthorEditComponent, AuthorService } from "./components/author";
import { CategoryListComponent, CategoryModelService, CategoryEditComponent, CategoryService } from "./components/category";
import { PublisherListComponent, PublisherModelService, PublisherEditComponent, PublisherService } from "./components/publisher";

import { UiSwitchModule } from 'ng2-ui-switch';
import { SpinnerModule } from 'angular2-spinner/dist';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgaModule,
    SharedModule,
    routing,
    UiSwitchModule,
    ModalModule.forRoot(),
    SpinnerModule,
    TypeaheadModule.forRoot(),
    PaginationModule.forRoot(),
  ],
  declarations: [
    SeoComponent,

    ProductListComponent,
    ProductEditComponent,

    AuthorListComponent,
    AuthorEditComponent,

    PublisherListComponent,
    PublisherEditComponent,

    CategoryListComponent,
    CategoryEditComponent
  ],
  providers: [
    AuthManager,
    ProductService,
    ProductModelService,

    AuthorService,
    AuthorModelService,

    CategoryService,
    CategoryModelService,

    PublisherService,
    PublisherModelService
  ]
})
export class SeoModule {

}
