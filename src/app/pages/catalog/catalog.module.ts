import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgaModule } from '../../theme/nga.module';
import { SharedModule } from '../../shared/shared.module';
import { routing } from "./catalog.routing";
import { ModalModule, TypeaheadModule, PaginationModule } from "ngx-bootstrap";
import { FilterPipe } from "../../pipes/filter.pipe";
import { AuthManager } from "../../authManager";
import { Catalog } from "./catalog.component";
import { CKEditorModule } from 'ng2-ckeditor';


import { AuthorsAddComponent } from "./components/authors/authors.add.component"
import { AuthorsListComponent } from "./components/authors/authors.list.component";
import { AuthorsEditComponent } from "./components/authors/authors.edit.component"
import { AuthorService } from "./components/authors/authors.service";
import { AuthorModelService } from "./components/authors/authors.model.service";
import { NationalityService } from "./components/authors/nationality.service"

import { PublisherAddComponent } from "./components/publishers/publisher.add.component";
import { PublisherListComponent } from "./components/publishers/publisher.list.component";
import { PublisherEditComponent } from "./components/publishers/publisher.edit.component";
import { PublisherAsyncValidator } from "./components/publishers/publisher.validator"
import { PublisherModelService } from "./components/publishers/publisher.model.service"
import { PublisherService } from "./components/publishers/publisher.service";

import { ProductListComponent, ImageUploaderComponent, ProductAddComponent, ProductEditComponent } from "./components/products";

import { ProductModelService } from "./components/products/products.model.service";
import { ProductService } from "./components/products/products.service";

import { CategoryAddComponent } from "./components/categories/category.add.component";
import { CategoryEditComponent } from "./components/categories/category.edit.component";
import { CategoryListComponent } from "./components/categories/category.list.component";
import { CategoryService } from "./components/categories/category.service";
import { CategoryModelService } from "./components/categories/category.model.service";

import { AttributesListComponent } from "./components/attribute/attributes.list.component";
import { AttributesAddComponent } from "./components/attribute/attributes.add.component";
import { AttributesEditComponent } from "./components/attribute/attributes.edit.component";
import { AttributesModelService } from "./components/attribute/attributes.model.service";
import { AttributesService } from "./components/attribute/attributes.service";

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
    CKEditorModule,
    TypeaheadModule.forRoot(),
    PaginationModule.forRoot(),
  ],
  declarations: [
    Catalog,
    FilterPipe,

    AuthorsAddComponent,
    AuthorsListComponent,
    AuthorsEditComponent,

    PublisherAddComponent,
    PublisherListComponent,
    PublisherEditComponent,

    ProductAddComponent,
    ProductListComponent,
    ProductEditComponent,

    CategoryAddComponent,
    CategoryEditComponent,
    CategoryListComponent,

    AttributesListComponent,
    AttributesAddComponent,
    AttributesEditComponent,

    PublisherAsyncValidator,
    ImageUploaderComponent
  ],
  providers: [
    AuthManager,

    CategoryService,
    CategoryModelService,

    AuthorService,
    AuthorModelService,
    NationalityService,

    PublisherService,
    PublisherModelService,

    ProductService,
    ProductModelService,

    AttributesService,
    AttributesModelService
  ]
})
export class CatalogModule {

}
