
import { SearchEventEmitter } from '../event-emitters/search-event-emitter';
import { CartEventEmitter } from '../event-emitters/cart-event-emitter';
import { AuthEventEmitter } from '../event-emitters/auth-event-emitter';
import { LanguageEventEmitter } from '../event-emitters/language-event-emitter';
import { SpinnerEventEmitter } from '../event-emitters/spinner-event-emitter';

export class PubSubService {

    SearchStream: SearchEventEmitter;
    CartStream: CartEventEmitter;
    AuthStatusStream: AuthEventEmitter;
    LanguageStream: LanguageEventEmitter
    ActiveSpinner: SpinnerEventEmitter

    constructor() {
        this.SearchStream = new SearchEventEmitter();
        this.CartStream = new CartEventEmitter();
        this.AuthStatusStream = new AuthEventEmitter();
        this.LanguageStream = new LanguageEventEmitter();
        this.ActiveSpinner = new SpinnerEventEmitter();
    }
}