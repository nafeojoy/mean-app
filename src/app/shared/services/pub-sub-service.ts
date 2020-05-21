
import { MessageEventEmitter } from '../event-emitters/message-event-emitter';


export class PubSubService {

    MessageStream: MessageEventEmitter;

    constructor() {
        this.MessageStream = new MessageEventEmitter();
    }
}