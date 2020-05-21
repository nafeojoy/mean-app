import { Component, Input, Output, EventEmitter, ElementRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import * as moment from 'moment';
import 'style-loader!./aro-datepicker.scss';

@Component({
    selector: 'aro-datepicker',
    host: {
        '(document:click)': 'handleClick($event)',
    },
    templateUrl: './aro-datepicker.html',
})
export class ArobilDatepickerComponent {

    private _newDate = new BehaviorSubject<any[]>([]);
    @Output()
    dateLoader: EventEmitter<any> = new EventEmitter();

    @Input()
    set aroModel(value) {
        this._newDate.next(value);
        this.date_time = this.date_formats(value);
    };

    get aroModel() {
        return this._newDate.getValue();
    }

    @Input()
    set aroFModel(value) {
        this._newDate.next(value);
    };
    get aroFModel() {
        return this._newDate.getValue();
    }



    public dt: Date = new Date();
    public minDate: Date = void 0;
    public events: any[];
    public tomorrow: Date;
    public afterTomorrow: Date;
    public dateDisabled: { date: Date, mode: string }[];
    public formats: string[] = ['DD-MM-YYYY', 'YYYY/MM/DD', 'DD.MM.YYYY',
        'shortDate'];
    public format: string = this.formats[0];
    public dateOptions: any = {
        formatYear: 'YY',
        startingDay: 1
    };

    public date_time: any;
    public opened: boolean = false
    public elementRef;
    public constructor(myElement: ElementRef) {
        this.elementRef = myElement;
        (this.tomorrow = new Date()).setDate(this.tomorrow.getDate() + 1);
        (this.afterTomorrow = new Date()).setDate(this.tomorrow.getDate() + 2);
        (this.minDate = new Date()).setDate(this.minDate.getDate() - 1000);
        (this.dateDisabled = []);
        this.events = [
            { date: this.tomorrow, status: 'full' },
            { date: this.afterTomorrow, status: 'partially' }
        ];

    }

    // ngOnInit() {
    //     console.log("asghdsgd");
    //     console.log(this.aroModel);
    // }

    handleClick(event) {
        var clickedComponent = event.target;

       // console.log(event.type);

        // console.log(this.elementRef.nativeElement);
        var inside = false;
        do {
            if (clickedComponent === this.elementRef.nativeElement) {
                inside = true;
            }
            clickedComponent = clickedComponent.parentNode;
        } while (clickedComponent);

        if (inside) {
            // this.opened = true;
            // console.log('inside');
        } else {
            // console.log('outside');
            //  this.opened = false;
        }
    }
    //----------------  next work
    public getDate(): number {
        return this.dt && this.dt.getTime() || new Date().getTime();
    }
    public datepickerOpen() {
        // this.opened = true;

        if(this.opened == true)
        {
            this.opened = false;
        }
        else{
            this.opened = true;
        }
    }
    public onSelectionDone(event: any) {
        let d = this.date_formats(event);
        this.date_time = d.toString();
        var nd = new Date();
        let select = new Date(event);
        select.setHours(nd.getHours());
        select.setSeconds(nd.getSeconds());
        select.setSeconds(nd.getSeconds());
        select.setMilliseconds(nd.getMilliseconds());
        this.dateLoader.emit({ dt: select, date: this.date_time })
        this.opened = false;
    }

    public date_formats(event) {
        let d = new Date(event);
        let get_Month = (d.getMonth() + 1).toString();
        let m_lenth = get_Month.length;
        
        if (m_lenth == 1) {
            get_Month = "0" + get_Month;
        }
        var get_date = d.getDate().toString();
        let dlenth = get_date.length;

        if (dlenth == 1) {
            get_date = "0" + get_date;
        }
        let days = d.getFullYear() + "-" + get_Month + "-" + get_date;
        return days;
    }


}
