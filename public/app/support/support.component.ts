import { Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'support',
    encapsulation: ViewEncapsulation.None,
   template: `
                <router-outlet></router-outlet>
            `

})
export class SupportComponent { }