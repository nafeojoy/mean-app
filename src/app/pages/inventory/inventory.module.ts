import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UiSwitchModule } from 'ng2-ui-switch/dist';
import { ModalModule, TypeaheadModule, PaginationModule, AlertModule, BsDatepickerModule } from "ngx-bootstrap";

import { NgaModule } from '../../theme/nga.module';
import { SharedModule } from '../../shared/shared.module';
import { AuthManager } from "../../authManager";

import { routing } from "./inventory.routing";
import { InventoryComponent } from "./inventory.component";
import { SpinnerModule } from 'angular2-spinner/dist';

import { PurchaseAcceptComponent } from "./components/purchase-accept/purchase-accept.component";
import { PurchaseAcceptEditComponent } from "./components/purchase-accept/purchase-accept.edit.component";
import { PurchaseAcceptListComponent } from "./components/purchase-accept/purchase-accept.list.component";
import { PurchaseAcceptService } from "./components/purchase-accept/purchase-accept.service";

import { BreakBundleService } from "./components/break-bundle/break-bundle.service";
import { BreakBundleComponent } from "./components/break-bundle/break-bundle.component";


import { PurchaseOrderAddComponent, PurchaseOrderListComponent, PurchaseOrderEditComponent, PendingBookListComponent, PurchaseOrderService } from "./components/purchase-order";
import { SupplierAddComponent, SupplierEditComponent, SupplierListComponent, SupplierService } from "./components/supplier";
import { EmployeeAddComponent, EmployeeEditComponent, EmployeeListComponent, EmployeeService} from "./components/employee";
import { GeneralPurchaseComponent } from './components/purchase-accept/general-purchase.component';
import { ProductAnalysisComponent } from './components/product-analysis/product-analysis.component';
import { ProductAnalysisService } from './components/product-analysis/product-analysis.service';




@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        NgaModule,
        SharedModule,
        routing,
        ModalModule.forRoot(),
        TypeaheadModule.forRoot(),
        PaginationModule.forRoot(),
        AlertModule.forRoot(),
        UiSwitchModule,
        SpinnerModule,
        BsDatepickerModule.forRoot(),
    ],
    declarations: [
        InventoryComponent,
        PurchaseAcceptComponent,
        PurchaseAcceptEditComponent,
        PurchaseAcceptListComponent,
        GeneralPurchaseComponent,

        PendingBookListComponent,
        PurchaseOrderAddComponent,
        PurchaseOrderListComponent,
        PurchaseOrderEditComponent,

        SupplierAddComponent,
        SupplierEditComponent,
        SupplierListComponent,

        EmployeeAddComponent,
        EmployeeEditComponent,
        EmployeeListComponent,
        ProductAnalysisComponent,
        BreakBundleComponent,
    ],
    providers: [
        AuthManager,
        PurchaseAcceptService,
        PurchaseOrderService,
        SupplierService,
        EmployeeService,
        ProductAnalysisService,
        BreakBundleService,

    ]
})
export class InventoryModule {

}
