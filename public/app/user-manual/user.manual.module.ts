import { NgModule, ApplicationRef } from '@angular/core';
import { routing } from './user.manual.routing';

import { UserManualComponent } from './user.manual.component';
import { DiscountCardComponent } from './component/discount-card';
import { SharedModule } from "../shared/shared.module";

@NgModule({
    declarations: [
        UserManualComponent,
        DiscountCardComponent
    ],
    imports: [
        routing, SharedModule
    ],
    providers: [],

    exports: []
})

export class UserManualModule { }