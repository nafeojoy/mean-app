import { Routes, RouterModule } from '@angular/router';
import { PolicyComponent } from './policy.component';

import { BuyPolicyComponent } from "./components/buy-policy";
import { PrivacyPolicyComponent } from "./components/privacy-policy";
import { TermsOfUseComponent } from "./components/terms-of-use";

const routes: Routes = [
  {
    path: '',
    component: PolicyComponent,
    children: [
      { path: 'buy-policy', component: BuyPolicyComponent },
      { path: 'privacy-policy', component: PrivacyPolicyComponent },
      { path: 'terms-of-use', component: TermsOfUseComponent },
    ]
  }
];

export const routing = RouterModule.forChild(routes);