import { Component, ViewEncapsulation, OnInit, ViewChild, Input } from '@angular/core';

import { Subject } from 'rxjs/Subject';
//import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/merge';

import 'style-loader!./slider.scss';

@Component({
    selector: 'menu-selector',
    templateUrl: './menu-selector.html',
    encapsulation: ViewEncapsulation.None
})

export class MenuSelectorComponent {

    //@Input() public items: Observable<any[]>;
    //public pageSubject: Subject<any[]> = new Subject<any[]>();
  
    @Input() public nextRoute: string;
    @Input() public loadUrl: string;

    public inputItems: any;
    private _items = new BehaviorSubject<any[]>([]);

    @Input()
    set items(value) {
        this._items.next(value);
    }

    get items() {
        return this._items.getValue();
    }

    ngOnInit() {
        /*  this.pageSubject.merge(this.items).subscribe(res => {
              this.inputItems = res;
          });*/

        this._items.subscribe(res => {
            this.inputItems = res;
        })
    }
}