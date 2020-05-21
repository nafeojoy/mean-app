import { Subject } from 'rxjs/Subject';

export class SearchEventEmitter extends Subject<any>{
   constructor() {
       super();
   }
   emit(value) { super.next(value); }
}