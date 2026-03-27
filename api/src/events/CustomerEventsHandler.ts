import eventEmitter from '../util/events';
import { CustomerEventType } from '../model/data/CustomerEventType';
import { CustomerMetadata } from '../model/data/customer/CustomerMetadata';

class CustomerEventsHandler {

    public async send( type: CustomerEventType,  parameters: CustomerMetadata) {
        eventEmitter.emit(type, parameters);
    }

}