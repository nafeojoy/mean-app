import { Routes, RouterModule } from '@angular/router';
import { BillingComponent } from './billing.component';

import { CartComponent } from './components/cart';
import { ShippingComponent } from './components/shipping';
import { PaymentComponent } from './components/payment';

const routes: Routes = [
  {
    path: '',
    component: BillingComponent,
    children: [
      { path: 'cart', component: CartComponent },
      { path: 'shipping', component: ShippingComponent },
      { path: 'payment', component: PaymentComponent },
    ]
  }
];

export const routing = RouterModule.forChild(routes);