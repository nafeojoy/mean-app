import { Component, Input, Output, EventEmitter, ElementRef } from '@angular/core';
import { Router } from "@angular/router";
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'style-loader!./search-typeahead.scss';

@Component({
    selector: 'search-typeahead',
    templateUrl: './search-typeahead.html',
    host: {
        '(document:click)': 'handleClick($event)',
    },
})

export class SearchTypeaheadComponent {

    @Input() public items: Array<any> = [];
    @Input() public image: boolean;
    private _value = new BehaviorSubject<any[]>([]);
    private _clear = new BehaviorSubject<any[]>([]);

    @Output()
    dataLoader: EventEmitter<any> = new EventEmitter();

    @Output()
    textEmit: EventEmitter<any> = new EventEmitter();

    @Output()
    selectedLoader: EventEmitter<any> = new EventEmitter();
    public searchText: any;
    public elementRef;
    private subSearchStream: any;

    @Input()
    set clearField(value) {
      this._clear.next(value);
      if (value) {
        this.searchText = '';
      }
    };
  
    get clearField() {
      return this._clear.getValue();
    }
  
  
    @Input()
    set inputValue(value) {
      this._value.next(value);
      this.searchText = value;
  
    };
  
    get inputValue() {
      return this._value.getValue();
    }

    constructor(private router: Router, myElement: ElementRef) {
        this.elementRef = myElement;
    }

    ngOnInit() {
    }

    getText(text){
        this.textEmit.emit(text);
    }

    typed(text) {
        if (text.length == 0) {
            this.items = [];
        } else {
            let txt=text.trim();
            this.dataLoader.emit(txt);
        }
    }

    getDetail(item) {
        this.searchText = item.name;
        this.selectedLoader.emit(item);
        this.items = [];
    }



    handleClick(event) {
        var clickedComponent = event.target;
        var inside = false;
        do {
            if (clickedComponent === this.elementRef.nativeElement) {
                inside = true;
            }
            clickedComponent = clickedComponent.parentNode;
        } while (clickedComponent);

        if (inside) {
            // console.log('inside');
        } else {
            //console.log('outside');
            //this.searchText = null;
            this.items = [];
        }
    }
}
