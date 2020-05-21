import { NgModule, ApplicationRef } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { routing } from './info-pages.routing';
import { InfoPagesComponent } from "./info-pages.component";
import { AboutUsComponent } from "./components/about-us";
import { ReturnPolicyComponent } from "./components/return-policy";
import { ContactUsComponent } from "./components/contact-us";
import { ErrorPageComponent } from "./components/error-page";
import { PayAfterComponent, PayAfterService } from "./components/pay-after";

import { MailVerifyComponent } from "./components/mail-verify";

@NgModule({
    declarations: [
        InfoPagesComponent,
        AboutUsComponent,
        ContactUsComponent,
        ErrorPageComponent,
        MailVerifyComponent,
        ReturnPolicyComponent,
        PayAfterComponent
    ],
    imports: [
        routing,
        SharedModule
    ],
    providers: [PayAfterService]
})

export class InfoPagesModule { }
