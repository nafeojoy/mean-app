import { Routes, RouterModule } from '@angular/router';
import { PolicyComponent } from './policy.component';
import { AuthManager } from '../authManager';

import { BuyPolicyComponent } from "./components/buy-policy";
import { PrivacyPolicyComponent } from "./components/privacy-policy";
import { TermsOfUseComponent } from "./components/terms-of-use";

const routes: Routes = [
  {
    path: '',
    component: PolicyComponent,
    children: [
      { path: 'buy-policy', component: BuyPolicyComponent, canActivate: [AuthManager] },
      { path: 'privacy-policy', component: PrivacyPolicyComponent, canActivate: [AuthManager] },
      { path: 'terms-of-use', component: TermsOfUseComponent, canActivate: [AuthManager] },
    ]
  }
];

export const routing = RouterModule.forChild(routes);