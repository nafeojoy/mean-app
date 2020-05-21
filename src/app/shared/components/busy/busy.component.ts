/**
 * @file Component: Busy
 * @author yumao<yuzhang.lille@gmail.com>
 */

import {
    Component,
    trigger,
    state,
    style,
    transition,
    animate
} from '@angular/core';

import { PromiseTrackerService } from './promise-tracker.service';


const inactiveStyle = style({
    opacity: 0,
    transform: 'translateY(-40px)'
});
const timing = '.3s ease';

export interface IBusyContext {
    message: string;
};
// import 'style-loader!./busy.scss';
@Component({
    selector: 'ng-busy',
    templateUrl: "./busy.html",
    animations: [
        trigger('flyInOut', [
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
export class BusyComponent {
    message: string;
    wrapperClass: string;
    template: string;
    context: IBusyContext = {
        message: ""
    };

    constructor(private tracker: PromiseTrackerService) {
    }

    isActive() {
        return this.tracker.isActive();
    }
}
