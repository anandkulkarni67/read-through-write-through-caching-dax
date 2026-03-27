import { ServiceStatusValue } from './ServiceStatusValue';
import { Service } from './Service';

export interface Status {

    service: Service;
    status: ServiceStatusValue;
    metadata?: any;
}