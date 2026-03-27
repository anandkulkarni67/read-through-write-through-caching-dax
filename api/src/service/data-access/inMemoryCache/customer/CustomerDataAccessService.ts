
import { CustomerMetadata } from '../../../../model/data/customer/CustomerMetadata';
import { GetCustomerMetadata } from '../../../../model/data/customer/GetCustomerMetadata';
import { UpdateCustomerMetadata } from '../../../../model/data/customer/UpdateCustomerMetadata';
import customerDataCache from '../../../../util/cacheUtil';
import { DataAccessService } from '../DataAccessService';

class CustomerDataAccessService implements DataAccessService<string, CustomerMetadata, GetCustomerMetadata> {

    public async addCustomer(metadata: GetCustomerMetadata): Promise<void> {
        try {
            customerDataCache.set(metadata.id, metadata, process.env.IN_MEMORY_CACHE_TTL_SECONDS);
        } catch (error: any) {
            throw error;
        }
    }

    public async updateCustomer(id: string, metadata: UpdateCustomerMetadata): Promise<void> {
        try {
            customerDataCache.set(id, metadata, process.env.IN_MEMORY_CACHE_TTL_SECONDS);
        } catch (error: any) {
            throw error;
        }
    }

    public async deleteCustomer(customerId: String): Promise<void> {
        try {
            customerDataCache.del(customerId);
        } catch (error: any) {
            throw error;
        }
    }

    public async getCustomer(customerId: String): Promise<GetCustomerMetadata> {
        try {
            return customerDataCache.get(customerId);
        } catch (error: any) {
            throw error;   
        }
    }

    public async populateData(metadata: GetCustomerMetadata): Promise<void> {
        try {
            customerDataCache.set(metadata.id, metadata);
        } catch (error: any) {
            throw error;
        }
    }

    public async flush(): Promise<void> {
        try {
            customerDataCache.flushAll();
        } catch (error: any) {
            throw error;
        }
    }

}

export const customerDataAccessService = new CustomerDataAccessService();