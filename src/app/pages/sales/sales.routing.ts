import { Routes, RouterModule } from '@angular/router';

import { SalesComponent } from "./sales.component";


import { OrderComponent } from "./components/order";
import { PurchaseRequisitionCreateComponent } from "./components/creare-purchase-requisition";

import { AuthManager } from '../../authManager'
import { DispatchWaitingOrderComponent } from './components/wating-for-dispatch';
import { InshipmentWaitingOrderComponent } from './components/wating-for-inshipment';
import { DeliveryWaitingOrderComponent } from './components/wating-for-delivery';
import { PaymentCollectionComponent } from './components/payment-collection';
import { OrderCreateComponent } from "./components/order-create";
import { OrderEditComponent } from "./components/order-edit";
import { QueryListComponent, QueryAddComponent } from "./components/customer-query";
import { ProcessBackorderComponent } from "./components/backorder-process";
import { BookToBuyComponent } from './components/book-to-buy/book-to-buy.component';
import { WalletAdjustmentComponent } from './components/wallet-adjustment';
import { RefundRequestComponent } from './components/refund-request';
import { RefundExecuteComponent } from './components/refund-execute';
import { FindOrderIdComponent } from './components/find-orderid-for-bkash';

const routes: Routes = [
  {
    path: '',
    component: SalesComponent,
    children: [
      { path: 'order', component: OrderComponent, canActivate: [AuthManager] },
      { path: 'order/edit/:id', component: OrderEditComponent, canActivate: [AuthManager] },
      { path: 'create-purchase-requisition', component: PurchaseRequisitionCreateComponent },
      { path: 'waiting-for-dispatch', component: DispatchWaitingOrderComponent },
      { path: 'waiting-for-inshipment', component: InshipmentWaitingOrderComponent },
      { path: 'waiting-for-delivery', component: DeliveryWaitingOrderComponent },
      { path: 'payment-collect', component: PaymentCollectionComponent },
      { path: 'create-order', component: OrderCreateComponent },
      { path: 'customer-queries', component: QueryListComponent, canActivate: [AuthManager] },
      { path: 'process-backorder', component: ProcessBackorderComponent, canActivate: [AuthManager] },
      { path: 'customer-queries/add', component: QueryAddComponent },
      { path: 'book-to-buy', component: BookToBuyComponent, canActivate: [AuthManager]},
      { path: 'wallet-adjustment', component: WalletAdjustmentComponent, canActivate: [AuthManager]}, //, canActivate: [AuthManager]
      { path: 'refund-request', component: RefundRequestComponent, canActivate: [AuthManager]}, //, canActivate: [AuthManager]
      { path: 'bkash-orderId', component: FindOrderIdComponent, canActivate: [AuthManager] },
      { path: 'refund-execute', component: RefundExecuteComponent, canActivate: [AuthManager]} //, canActivate: [AuthManager]
    ]
  }
];

export const routing = RouterModule.forChild(routes);
