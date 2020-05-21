import { Component, ViewEncapsulation, OnInit, ViewChild, Input, EventEmitter, Output } from '@angular/core';
import { Router } from "@angular/router";
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { PubSubService } from '../../../shared/services/pub-sub-service';
import { FilterDataService } from '../../../shared/data-services/filter-data.service';
import 'rxjs/add/operator/merge';

import 'style-loader!./slider.scss';


@Component({
    selector: 'top-menu-list',
    templateUrl: './menu-selector.html',
    encapsulation: ViewEncapsulation.None
})

export class MenuSelectorComponent {

    @Input() public nextRoute: string;
    @Input() public loadUrl: string;

    public inputItems: any;
    private _items = new BehaviorSubject<any[]>([]);

    @Input()
    set items(value) {
        this._items.next(value);
    }

    @Output()
    itemSelectEvent: EventEmitter<any>=new EventEmitter();

    get items() {
        return this._items.getValue();
    }

    constructor(private pubSubService: PubSubService, private router: Router, private filterDataService: FilterDataService) { }


    ngOnInit() {
        this._items.subscribe(res => {
            this.inputItems = res;
        })
    }

    itemSelected(type, seo_url){
        this.pubSubService.SearchStream.emit({ search_type: type, search: seo_url });
    }
}