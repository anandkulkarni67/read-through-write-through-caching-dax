import { UpdateCustomerMetadata } from '../../../../model/data/customer/UpdateCustomerMetadata';
import { randomUUID } from 'crypto';
import { GetCustomerMetadata } from '../../../../model/data/customer/GetCustomerMetadata';
import { CreateCustomerMetadata } from '../../../../model/data/customer/CreateCustomerMetadata';
import customerDataCache from '../../../../util/cacheUtil';
import { NotFound } from '../../../../model/error/NotFound';
import { ResourceConflict } from '../../../../model/error/ResourceConflict';
import { DataAccessServiceWriteBehindCaching } from '../DataAccessServiceWriteBehindCaching';

class CustomerDataAccessServiceWriteBehindCaching implements DataAccessServiceWriteBehindCaching {

    public async addCustomer(metadata: CreateCustomerMetadata): Promise<GetCustomerMetadata> {
        try {
            const customerId = randomUUID();
            const customerMetadata = {
                ...metadata,
                id: customerId,
                version: 1
            };
            customerDataCache.set(customerId, customerMetadata);
            return customerMetadata;
        } catch (error: any) {
            throw error;
        }
    }

    public async updateCustomer(id: string, metadata: UpdateCustomerMetadata): Promise<GetCustomerMetadata> {
        try {
            const existingCustomerMetadata = customerDataCache.get(id);
            if (!existingCustomerMetadata) {
                throw new NotFound('Customer with [ customerId: ' + id + ' ] not found.'); 
            } else if (existingCustomerMetadata.version != metadata.version) {
                throw new ResourceConflict('State conflict for the Customer record [ customerId: ' + id + ' ]');
            } else {
                const customerMetadata = {
                    ...metadata,
                    id,
                    version: metadata.version + 1
                };
                customerDataCache.set(id, customerMetadata);
                return customerMetadata;
            }
        } catch (error: any) {
            throw error;
        }
    }

    public async deleteCustomer(customerId: String, version: number): Promise<void> {
        try {
            const existingCustomerMetadata = customerDataCache.get(customerId);
            if (!existingCustomerMetadata) {
                throw new NotFound('Customer with [ customerId: ' + customerId + ' ] not found.'); 
            } else if (existingCustomerMetadata.version != version) {
                throw new ResourceConflict('State conflict for the Customer record [ customerId: ' + customerId + ' ]');
            } else {
                customerDataCache.del(customerId);
            }
            
        } catch (error: any) {
            throw error;
        }
    }

    public async getCustomer(customerId: String): Promise<GetCustomerMetadata> {
        try {
            const customerMetadata = customerDataCache.get(customerId);
            if (!customerMetadata) {
                throw new NotFound('Customer [id: ' + customerId + '] not found.');
            }
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

export const customerDataAccessServiceWriteBehindCaching = new CustomerDataAccessServiceWriteBehindCaching();