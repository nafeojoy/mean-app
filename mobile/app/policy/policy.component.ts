import { Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'policy',
    encapsulation: ViewEncapsulation.None,
    template: `
                <router-outlet></router-outlet>
            `,
})
export class PolicyComponent { }