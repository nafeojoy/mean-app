import { NgModule, ApplicationRef } from '@angular/core';
// import { Ng2MapModule } from 'ng2-map';

import { SharedModule } from '../shared/shared.module';
import { routing } from './info-pages.routing';
import { InfoPagesComponent } from "./info-pages.component";
import { AboutUsComponent } from "./components/about-us";
import { ReturnPolicyComponent } from "./components/return-policy";
import { ContactUsComponent } from "./components/contact-us";
import { NewsComponent } from "./components/news";
import { MailVerifyComponent } from "./components/mail-verify";
import { PayAfterComponent, PayAfterService } from "./components/pay-after";


@NgModule({
    declarations: [
        InfoPagesComponent,
        AboutUsComponent,
        ContactUsComponent,
        NewsComponent,
        MailVerifyComponent,
        ReturnPolicyComponent,
        PayAfterComponent
    ],
    imports: [
        routing,
        SharedModule,
    ],
    providers: [PayAfterService]
})

export class InfoPagesModule { }
