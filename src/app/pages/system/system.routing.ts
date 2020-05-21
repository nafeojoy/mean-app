import { Routes, RouterModule } from '@angular/router';

import { System } from "./system.component";
import { AuthManager } from '../../authManager'

import { LanguageAddComponent, LanguageEditComponent, LanguageListComponent } from "./components/languages";
import { OfferAddComponent, OfferEditComponent, OfferListComponent } from "./components/offers";
import { CurrencyAddComponent, CurrencyEditComponent, CurrencyListComponent } from "./components/currencies";
import { WeightClassAddComponent, WeightClassEditComponent, WeightClassListComponent } from "./components/weight-classes";
import { LengthClassAddComponent, LengthClassEditComponent, LengthClassListComponent } from "./components/length-classes";
import { OrderStatusListComponent, OrderStatusAddComponent, OrderStatusEditComponent } from "./components/order-statuses";
import { DirectPayListComponent, DirectPayAddComponent, DirectPayEditComponent } from './components/direct-pay';
import { OrderCarrierAddComponent, OrderCarrierEditComponent, OrderCarrierListComponent } from "./components/order-carrier";
import { EmployeeAddComponent, EmployeeEditComponent, EmployeeListComponent } from "./components/employee";
import { GiftListComponent, GiftAddComponent, GiftEditComponent } from './components/gift';


const routes: Routes = [
  {
    path: '',
    component: System,
    children: [
      { path: 'localization/languages', component: LanguageListComponent, canActivate: [AuthManager] },
      { path: 'localization/languages/add', component: LanguageAddComponent, canActivate: [AuthManager] },
      { path: 'localization/languages/edit/:id', component: LanguageEditComponent, canActivate: [AuthManager] },

      { path: 'localization/offers', component: OfferListComponent, canActivate: [AuthManager] },
      { path: 'localization/offers/add', component: OfferAddComponent, canActivate: [AuthManager] },
      { path: 'localization/offers/edit/:id', component: OfferEditComponent, canActivate: [AuthManager] },

      { path: 'localization/gift', component: GiftListComponent, canActivate: [AuthManager] },
      { path: 'localization/gift/add', component: GiftAddComponent, canActivate: [AuthManager] },
      { path: 'localization/gift/edit/:id', component: GiftEditComponent, canActivate: [AuthManager] },

      { path: 'localization/currencies', component: CurrencyListComponent, canActivate: [AuthManager] },
      { path: 'localization/currencies/add', component: CurrencyAddComponent, canActivate: [AuthManager] },
      { path: 'localization/currencies/edit/:id', component: CurrencyEditComponent, canActivate: [AuthManager] },

      { path: 'localization/weight-classes', component: WeightClassListComponent, canActivate: [AuthManager] },
      { path: 'localization/weight-classes/add', component: WeightClassAddComponent, canActivate: [AuthManager] },
      { path: 'localization/weight-classes/edit/:id', component: WeightClassEditComponent, canActivate: [AuthManager] },

      { path: 'localization/length-classes', component: LengthClassListComponent, canActivate: [AuthManager] },
      { path: 'localization/length-classes/add', component: LengthClassAddComponent, canActivate: [AuthManager] },
      { path: 'localization/length-classes/edit/:id', component: LengthClassEditComponent, canActivate: [AuthManager] },

      { path: 'order-statuses', component: OrderStatusListComponent, canActivate: [AuthManager] },
      { path: 'order-statuses/add', component: OrderStatusAddComponent, canActivate: [AuthManager] },
      { path: 'order-statuses/edit/:id', component: OrderStatusEditComponent, canActivate: [AuthManager] },

      { path: 'payment-gateway', component: DirectPayListComponent, canActivate: [AuthManager] },
      { path: 'payment-gateway/add', component: DirectPayAddComponent, canActivate: [AuthManager] },
      { path: 'payment-gateway/edit/:id', component: DirectPayEditComponent, canActivate: [AuthManager] },

      { path: 'employee', component: EmployeeListComponent, canActivate: [AuthManager] },
      { path: 'employee/add', component: EmployeeAddComponent, canActivate: [AuthManager] },
      { path: 'employee/edit/:id', component: EmployeeEditComponent, canActivate: [AuthManager] },

      { path: 'order-carrier', component: OrderCarrierListComponent, canActivate: [AuthManager] },
      { path: 'order-carrier/add', component: OrderCarrierAddComponent, canActivate: [AuthManager] },
      { path: 'order-carrier/edit/:id', component: OrderCarrierEditComponent, canActivate: [AuthManager] }
    ]
  }
];

export const routing = RouterModule.forChild(routes);
