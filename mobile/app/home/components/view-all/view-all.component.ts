import { Component, ViewEncapsulation,Input } from '@angular/core';

@Component({
    selector: 'view-all',
    templateUrl: './view-all.html',
    encapsulation: ViewEncapsulation.None
})
export class ViewAllComponent {
    @Input() public nextPath: string;
    constructor() { }

    ngOnInit() {

    }
}