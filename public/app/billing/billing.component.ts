import { Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'billing',
    encapsulation: ViewEncapsulation.None,
    template: ` <navigator-block></navigator-block>
                <router-outlet></router-outlet>
            `,
})
export class BillingComponent { }