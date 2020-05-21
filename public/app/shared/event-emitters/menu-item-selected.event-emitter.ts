import { Subject } from 'rxjs/Subject';

export class MenuItemSelectedEventEmitter extends Subject<any>{
    constructor() {
        super();
    }
    emit(value) { super.next(value); }
}