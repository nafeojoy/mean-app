import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgaModule } from '../../theme/nga.module';
import { SharedModule } from '../../shared/shared.module';
import { routing } from "./approval.routing";
import { ModalModule, TypeaheadModule, PaginationModule } from "ngx-bootstrap";
import { AuthManager } from "../../authManager";
import { ApprovalComponent } from "./approval.component";

import { ProductListComponent, ProductService } from "./components/products";


import { UiSwitchModule } from 'ng2-ui-switch';
import { SpinnerModule } from 'angular2-spinner/dist';
import { NgxGalleryModule } from 'ngx-gallery';

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
    PaginationModule.forRoot(),
    NgxGalleryModule
  ],
  declarations: [
    ApprovalComponent,
    ProductListComponent,
  ],
  providers: [
    AuthManager,
    ProductService
  ]
})
export class ApprovalModule {

}
