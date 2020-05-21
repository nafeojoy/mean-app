import { Subject } from 'rxjs/Subject';

export class CartEventEmitter extends Subject<any>{
    constructor() {
        super();
    }
    emit(value) { super.next(value); }
}
