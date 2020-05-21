import { Subject } from 'rxjs/Subject';

export class SpinnerEventEmitter extends Subject<any>{
   constructor() {
       super();
   }
   emit(value) { super.next(value); }
}