
import { Subject } from 'rxjs/Subject';

export class LanguageEventEmitter extends Subject<Boolean>{
   constructor() {
       super();
   }
   emit(value) { super.next(value); }
}