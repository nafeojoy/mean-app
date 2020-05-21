import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule, PaginationModule, TabsModule, AlertModule, TooltipModule, BsDatepickerModule } from "ngx-bootstrap";
import { SimpleNotificationsModule } from 'angular2-notifications';
import { UiSwitchModule } from 'ng2-ui-switch';
import { NgaModule } from '../../theme/nga.module';
import { SharedModule } from '../../shared/shared.module';
import { SpinnerModule } from 'angular2-spinner/dist';
// import { QRCodeModule } from 'angularx-qrcode';


import { SalesComponent } from "./sales.component";

import {
    OrderComponent,
    OrderService
} from "./components/order";
import {
    PurchaseRequisitionCreateComponent,
    PurchaseRequisitionCreateService
} from './components/creare-purchase-requisition';

import { 
     OrderCreateComponent,
     OrderCreateService 
} from "./components/order-create";

import { 
    OrderEditComponent,
    OrderEditService 
} from "./components/order-edit";

import { 
    ProcessBackorderComponent,
    ProcessBackorderService
} from "./components/backorder-process";

import {
QueryListComponent,
QueryAddComponent,
QueryService
}from "./components/customer-query";

import {
    FindOrderIdComponent, FindBkashService
    }from "./components/find-orderid-for-bkash";

import { routing } from "./sales.routing";
import { AuthManager } from '../../authManager';
import { DispatchWaitingOrderComponent, DispatchWaitingOrderService } from './components/wating-for-dispatch';
import { InshipmentWaitingOrderComponent, InshipmentWaitingOrderService } from './components/wating-for-inshipment';
import { DeliveryWaitingOrderComponent, DeliveryWaitingOrderService } from './components/wating-for-delivery';
import { PaymentCollectionComponent, PaymentCollectionService } from './components/payment-collection';
import { BookToBuyComponent } from './components/book-to-buy/book-to-buy.component';
import { BookToBuyService } from './components/book-to-buy/book-to-buy.service';

import { WalletAdjustmentComponent, WalletAdjustmentService } from './components/wallet-adjustment';
import { RefundRequestComponent, RefundRequestService } from './components/refund-request';
import { RefundExecuteComponent, RefundExecuteService } from './components/refund-execute';
import { ExcelService } from '../../shared/services/excel-export.service';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgaModule,
        routing,
        UiSwitchModule,
        SharedModule,
        ModalModule.forRoot(), PaginationModule.forRoot(), TabsModule.forRoot(), AlertModule.forRoot(),TooltipModule.forRoot(),
        ReactiveFormsModule,
        SimpleNotificationsModule,
        SpinnerModule,
        BsDatepickerModule.forRoot(),
        // QRCodeModule
    ],
    declarations: [
        SalesComponent,
        OrderComponent,
        PurchaseRequisitionCreateComponent,
        DispatchWaitingOrderComponent,
        InshipmentWaitingOrderComponent,
        DeliveryWaitingOrderComponent,
        PaymentCollectionComponent,
        OrderCreateComponent,
        OrderEditComponent,
        QueryListComponent,
        QueryAddComponent,
        ProcessBackorderComponent,
        BookToBuyComponent,
        WalletAdjustmentComponent,
        RefundRequestComponent,
        RefundExecuteComponent,
        FindOrderIdComponent
    ],
    providers: [
        AuthManager,
        OrderService,
        PurchaseRequisitionCreateService,
        DispatchWaitingOrderService,
        InshipmentWaitingOrderService,
        DeliveryWaitingOrderService,
        PaymentCollectionService,
        OrderCreateService,
        OrderEditService,
        QueryService,
        ProcessBackorderService,
        BookToBuyService,
        WalletAdjustmentService,
        RefundRequestService,
        RefundExecuteService,
        FindBkashService,
        ExcelService
    ]
})
export class SalesModule { }
