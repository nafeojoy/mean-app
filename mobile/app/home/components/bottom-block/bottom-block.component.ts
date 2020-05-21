import { Component, ViewEncapsulation, Input } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Component({
  selector: 'bottom-block',
  templateUrl: './bottom-block.html',
  encapsulation: ViewEncapsulation.None
})


export class BottomBlockComponent {
  public inputItems: any;
  public cartItem: any;

  private _cartItems = new BehaviorSubject<any>([]);
  public _items = new BehaviorSubject<any[]>([]);

  @Input()
  set tabs(value) {
    this._items.next(value);
  }

  get tabs() {
    return this._items.getValue();
  }

  @Input()
  set cartItems(value) {
    if (value && value != undefined) {
      this._cartItems.next(value);
    }
  }
  get cartItems() {
    return this._cartItems;
  }
  constructor() { }

  ngOnInit() {
    this._items.subscribe(res => {
      this.inputItems = [];
      this.inputItems = res;
    })
    this._cartItems.subscribe(res => {
      this.cartItem = res;
    })
  }
}
