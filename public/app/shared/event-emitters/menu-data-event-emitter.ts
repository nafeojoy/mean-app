import { Subject } from 'rxjs/Subject';

export class MenuDataEmitter extends Subject<any>{
    constructor() {
        super();
    }
    emit(value) { super.next(value); }
}