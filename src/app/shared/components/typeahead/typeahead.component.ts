import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import 'style-loader!./typeahead.scss';

@Component({
    selector: 'typeahead',
    templateUrl: './typeahead.html',
})
export class TypeaheadComponent {
    private _items = new BehaviorSubject<any[]>([]);
    private _newAttribute = new BehaviorSubject<any[]>([]);
    @Input() public parentGroup: FormGroup;
    @Input() public isRequired: boolean;
    @Input() public display: string;
    @Input() public multiple: boolean;
    @Input() public inputValue: any = {};
    @Input() public canAddNewItem: boolean;
    @Input() public existItems: any = [];

    @Input()
    set newAttribute(value) {
        this._newAttribute.next(value);
        if (this._newAttribute.value) {
            console.log("1");
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
            return obj.name;
        })
        this.newItemList = newItems.filter((obj) => {
            return ids.indexOf(obj.name) == -1;
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
        this._id = "_id";
        if (this.isRequired) {
            if (this.inputValue) {
                this.parentGroup.addControl(this.display, new FormControl(this.inputValue[this.display], Validators.required));
                this.parentGroup.addControl(this._id, new FormControl(this.inputValue._id));
            } else {
                this.parentGroup.addControl(this._id, new FormControl(''));
                this.parentGroup.addControl(this.display, new FormControl('', Validators.required));
            }

        } else {
            if (this.inputValue) {
                this.parentGroup.addControl(this.display, new FormControl(this.inputValue[this.display]));
                this.parentGroup.addControl(this._id, new FormControl(this.inputValue._id));
            } else {
                this.parentGroup.addControl(this._id, new FormControl(''));
                this.parentGroup.addControl(this.display, new FormControl(''));
            }
        }

        if (this.existItems.length > 0) {
            this.tempList = this.existItems;
            this.finalList = this.existItems;
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
        this.tempList.push(item);
        this.newItemList.splice(i, 1);
        this.parentGroup.controls[this.display].setValue('');
        this.items = [];
        if (this.existItems.length < 1) {
            this.finalList.push(item);
            this.getSelected.emit(this.tempList);
        } else {
            this.getSelected.emit(this.finalList);
        }
    }

    getDetail(selected) {
        this.parentGroup.controls[this.display].setValue(selected[this.display])
        this.parentGroup.controls[this._id].setValue(selected._id)
        this.items = [];
    }

    setNew(text) {
        if (this.canAddNewItem) {
            this.tempList.push({ 'name': text, '_id': '', 'isNew': true });
            this.parentGroup.controls[this.display].setValue('');
        }
    }


    save(item) {
        item.isNew = false;
        this.saveNewItem.emit(item);
    }

    removeItem(index) {
        this.tempList.splice(index, 1);
        if (this.existItems.length < 1) {
            this.getSelected.emit(this.tempList);
        } else {
            this.getSelected.emit(this.finalList);
        }
    }
}
