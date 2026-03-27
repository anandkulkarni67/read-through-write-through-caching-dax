import { UpdateCustomerMetadata } from '../../../model/data/customer/UpdateCustomerMetadata';
import { GetCustomerMetadata } from '../../../model/data/customer/GetCustomerMetadata';
import { CreateCustomerMetadata } from '../../../model/data/customer/CreateCustomerMetadata';
import { customerDataAccessServiceWriteBehindCaching as customerDataCache } from '../../data-access/inMemoryCache/customer/CustomerDataAccessServiceWriteBehindCaching';
import { customerDataAccessServiceWriteBehindCaching as customerData } from '../../data-access/dynamodb/customer/CustomerDataAccessServiceWriteBehindCaching';
import eventEmitter from '../../../util/events';
import { CustomerEventType } from '../../../model/data/CustomerEventType';
import { CustomerService } from './CustomerService';
import { NotFound } from '../../../model/error/NotFound';

// Write-Behind caching technique implementation.
export class CustomerServiceWriteBehind implements CustomerService<string> {

    constructor() {
        eventEmitter.on(CustomerEventType.CREATE, async (metadata) => await customerData.addCustomer);
        eventEmitter.on(CustomerEventType.UPDATE, async (id, metadata) => await customerData.updateCustomer);
        eventEmitter.on(CustomerEventType.DELETE, async (id, version) => await customerData.deleteCustomer);
    }

    public async addCustomer(metadata: CreateCustomerMetadata): Promise<GetCustomerMetadata> {
        try {
            const customerMetadata = await customerDataCache.addCustomer(metadata);
            eventEmitter.emit(CustomerEventType.CREATE, customerMetadata);
            return customerMetadata;
        } catch (error: any) {
            throw error;
        }
    }

    public async updateCustomer(id: string, metadata: UpdateCustomerMetadata): Promise<GetCustomerMetadata> {
        try {
            const updatedMetadata = await customerDataCache.updateCustomer(id, metadata);
            eventEmitter.emit(CustomerEventType.UPDATE, id, updatedMetadata);
            return updatedMetadata;
        } catch (error: any) {
            throw error;
        }
    }

    public async deleteCustomer(customerId: String, version: number): Promise<void> {
        try {
            await customerDataCache.deleteCustomer(customerId, version);
            eventEmitter.emit(CustomerEventType.UPDATE, customerId, version);
        } catch (error: any) {
            throw error;
        }
    }

    public async getCustomer(customerId: String): Promise<GetCustomerMetadata> {
        try {
            const existingMetadata: GetCustomerMetadata = await customerDataCache.getCustomer(customerId);
            console.log('Cache Hit: Customer [ customerId: ' + customerId + ' ]');
            return existingMetadata;
        } catch (error: any) {
            if (error.constructor == NotFound) {
                try {
                    console.log('Cache Miss: Customer [ customerId: ' + customerId + ' ]');
                    const existingMetadata = await customerData.getCustomer(customerId);
                    await customerDataCache.populateData(existingMetadata);
                    return existingMetadata;
                } catch (error: any) {
                    throw error;
                }
            }
            throw error;  
        }
    }

}