import { NgModule, ApplicationRef } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { routing } from './policy.routing'
import { PolicyComponent } from './policy.component';
import { BuyPolicyComponent } from "./components/buy-policy";
import { PrivacyPolicyComponent } from "./components/privacy-policy";
import { TermsOfUseComponent } from "./components/terms-of-use";


@NgModule({
    declarations: [
        PolicyComponent,
        BuyPolicyComponent,
        PrivacyPolicyComponent,
        TermsOfUseComponent,
    ],
    imports: [
        routing,
        SharedModule,
    ],
    providers: []
})

export class PolicyModule { }