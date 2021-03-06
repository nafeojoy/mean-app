

import {
    Component,
    trigger,
    state,
    style,
    transition,
    animate
} from '@angular/core';

import {PromiseTrackerService} from './promise-tracker.service';

const inactiveStyle = style({
    opacity: 0,
});
const timing = '.3s ease';

@Component({
    selector: 'ng-busy-backdrop',
    template: `
        <div class="ng-busy-backdrop"
             @fadeInOut
             *ngIf="isActive()">
        </div>
    `,
    animations: [
        trigger('fadeInOut', [
            transition('void => *', [
                inactiveStyle,
                animate(timing)
            ]),
            transition('* => void', [
                animate(timing, inactiveStyle)
            ])
        ])
    ]
})
export class BusyBackdropComponent {
    constructor(private tracker: PromiseTrackerService) {
    }

    isActive() {
        return this.tracker.isActive();
    }
}
