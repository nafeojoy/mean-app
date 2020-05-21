import { Subject } from 'rxjs/Subject';

export class AuthEventEmitter extends Subject<any>{
    constructor() {
        super();
    }
    emit(value) { super.next(value); }
}