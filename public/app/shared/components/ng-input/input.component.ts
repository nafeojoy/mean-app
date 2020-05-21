import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'ng-input',
    templateUrl: './input.html'
})
export class NgInputComponent {

    inputValue = 0;
    val: any;
    @Output() inputModelChange = new EventEmitter();

    @Input()
    get inputModel() {
        return this.inputValue;
    }

    set inputModel(val) {
        this.inputValue = val;
        this.inputModelChange.emit(this.inputValue);
    }

    inputChange(value) {
        this.val = value;
        this.inputValue = value;
        this.inputModelChange.emit(value);
    }

}