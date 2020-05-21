import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import 'style-loader!./input-typeahead.scss';

@Component({
    selector: 'input-typeahead',
    templateUrl: './input-typeahead.html',
})
export class InputTypeaheadComponent {

    private _items = new BehaviorSubject<any[]>([]);
    private _newAttribute = new BehaviorSubject<any[]>([]);
    private _tempList = new BehaviorSubject<any[]>([]);

    @Input() public parentGroup: FormGroup;
    @Input() public isRequired: boolean;
    @Input() public display: string;
    @Input() public multiple: boolean;
    @Input() public inputValue: any = {};
    @Input() public canAddNewItem: boolean;
    @Input() public existItems: any = [];

    @Input() public isQty: boolean;
    @Input() public isRate: boolean;
    @Input() public needValidQuantity: boolean;

    public text: String;
    public hasError: boolean;
    public errorMessage: any;

    @Input()
    set newAttribute(value) {
        this._newAttribute.next(value);
        if (this._newAttribute.value) {
            this.finalList.push(this._newAttribute.value);
            this.getSelected.emit(this.finalList);
        }
    };

    get newAttribute() {
        return this._newAttribute.getValue();
    }

    @Input()
    set items(value) {
        this._items.next(value);
        let newItems = this._items.value;
        var ids = this.tempList.map(function (obj) {
            return obj._id;
        })
        this.newItemList = newItems.filter((obj) => {
            return ids.indexOf(obj._id) == -1;
        })
    }

    get items() {
        return this._items.getValue();
    }

    @Output()
    dataLoader: EventEmitter<any> = new EventEmitter();
    @Output()
    getSelected: EventEmitter<any> = new EventEmitter();
    @Output()
    saveNewItem: EventEmitter<any> = new EventEmitter();

    public selectedItem: string;
    public _id: string;
    public tempList: any = [];
    public finalList: any = [];
    public newItemList: any = [];
    constructor() { };

    ngOnInit() {
        // this._id = "_id";
        // if (this.isRequired) {
        //     if (this.inputValue) {
        //         this.parentGroup.addControl(this.display, new FormControl(this.inputValue[this.display], Validators.required));
        //         this.parentGroup.addControl(this._id, new FormControl(this.inputValue._id));
        //     } else {
        //         this.parentGroup.addControl(this._id, new FormControl(''));
        //         this.parentGroup.addControl(this.display, new FormControl('', Validators.required));
        //     }

        // } else {
        //     if (this.inputValue) {
        //         this.parentGroup.addControl(this.display, new FormControl(this.inputValue[this.display]));
        //         this.parentGroup.addControl(this._id, new FormControl(this.inputValue._id));
        //     } else {
        //         this.parentGroup.addControl(this._id, new FormControl(''));
        //         this.parentGroup.addControl(this.display, new FormControl(''));
        //     }
        // }
        if (this.existItems.length > 0) {
            this.tempList = this.existItems;
        }
    }

    typed(text) {
        if (text.length == 0) {
            this.items = [];
        } else {
            this.dataLoader.emit(text);
        }
    }

    getItem(item, i) {
        item.quantity = item.quantity ? parseInt(item.quantity) : 0;
        item.rate = item.rate ? parseInt(item.rate) : 0;
        if (this.needValidQuantity) {
            if (item.quantity > 0) {
                if (parseInt(item.quantity) <= parseInt(item.stock_quantity)) {
                    this.hasError = false;
                    this.errorMessage = {};
                    this.text = '';
                    this.finalList.push(item);
                    this.tempList.push(item);
                    this.newItemList.splice(i, 1);
                    this.items = [];
                    this.getSelected.emit(this.tempList);
                } else {
                    this.hasError = true;
                    this.errorMessage = { title: "Insufficient Quantity", desc: "You have only " + item.stock_quantity + " item in your stock" }
                    setTimeout(() => {
                        this.hasError = false;
                        this.errorMessage = {};
                    }, 3000)
                }
            } else {
                this.hasError = true;
                this.errorMessage = { title: "Invalid Quantity", desc: "Quantity must be greater than 0" }
                setTimeout(() => {
                    this.hasError = false;
                    this.errorMessage = {};
                }, 3000)
            }
        } else {
            if (this.isRate) {
                if (item.rate > 0) {
                    this.checkValidQtyAndSave(item, i);
                } else {
                    this.hasError = true;
                    this.errorMessage = { title: "Invalid Rate", desc: "Rate must be greater than 0" }
                    setTimeout(() => {
                        this.hasError = false;
                        this.errorMessage = {};
                    }, 3000)
                }
            } else {
                this.checkValidQtyAndSave(item, i);
            }

        }

    }

    checkValidQtyAndSave(item, i) {
        if (item.quantity > 0) {
            this.text = '';
            this.finalList.push(item);
            this.tempList.push(item);
            this.newItemList.splice(i, 1);
            this.items = [];
            this.getSelected.emit(this.tempList);
        } else {
            this.hasError = true;
            this.errorMessage = { title: "Invalid Quantity", desc: "Quantity must be greater than 0" }
            setTimeout(() => {
                this.hasError = false;
                this.errorMessage = {};
            }, 3000)
        }
    }

    getDetail(selected) {
        this.items = [];
    }

    setNew(text) {
        if (this.canAddNewItem) {
            this.tempList.push({ 'name': text, '_id': '', 'isNew': true });
            this.parentGroup.controls[this.display].setValue('');
        }
    }

    sendSelectedItem() {
        // this.getSelected.emit(this.finalList);
    }

    save(item) {
        item.isNew = false;
        this.saveNewItem.emit(item);
    }

    removeItem(index) {
        this.tempList.splice(index, 1);
        this.getSelected.emit(this.tempList);
    }
}
