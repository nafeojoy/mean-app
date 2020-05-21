import { Subject } from 'rxjs/Subject';

export class MessageEventEmitter extends Subject<any>{
    constructor() {
        super();
    }
    emit(value) { super.next(value); }
}
