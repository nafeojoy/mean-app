import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgaModule } from '../../theme/nga.module';
import { SharedModule } from '../../shared/shared.module';
import { routing } from "./miscellaneous.routing";
import { ModalModule, AlertModule } from "ngx-bootstrap";

import { UiSwitchModule } from 'ng2-ui-switch';
import { SpinnerModule } from 'angular2-spinner/dist';
import { MiscellaneousComponent } from './miscellaneous.component';

import { PartialOrderReturnComponent, PartialOrderReturnService } from './components/partial-return';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgaModule,
    SharedModule,
    routing,
    UiSwitchModule,
    ModalModule.forRoot(), AlertModule.forRoot(),
    SpinnerModule
  ],
  declarations: [
    MiscellaneousComponent,
    PartialOrderReturnComponent
  ],
  providers: [
    PartialOrderReturnService
  ]
})
export class MiscellaneousModule {

}
