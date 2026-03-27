import { UpdateCustomerMetadata } from '../../../model/data/customer/UpdateCustomerMetadata';
import { GetCustomerMetadata } from '../../../model/data/customer/GetCustomerMetadata';
import { CreateCustomerMetadata } from '../../../model/data/customer/CreateCustomerMetadata';
import { customerDataAccessService as customerData } from '../../data-access/dynamodb/customer/CustomerDataAccessService';
import { customerDataAccessService as customerDataCache } from '../../data-access/inMemoryCache/customer/CustomerDataAccessService';
import { CustomerService } from './CustomerService';

// Cache-Aside caching technique implementation.
export class CustomerServiceCacheAside implements CustomerService<string> {

    public async addCustomer(metadata: CreateCustomerMetadata): Promise<GetCustomerMetadata> {
        try {
            const customerMetadata = await customerData.addCustomer(metadata);
            return customerMetadata;
        } catch (error: any) {
            throw error;
        }
    }

    public async updateCustomer(id: string, metadata: UpdateCustomerMetadata): Promise<GetCustomerMetadata> {
        try {
            const updatedMetadata = await customerData.updateCustomer(id, metadata);
            await customerDataCache.deleteCustomer(updatedMetadata.id);
            return updatedMetadata;
        } catch (error: any) {
            throw error;
        }
    }

    public async deleteCustomer(id: String, version: number): Promise<void> {
        try {
            await customerData.deleteCustomer(id, version);
            await customerDataCache.deleteCustomer(id);
        } catch (error: any) {
            throw error;
        }
    }

    public async getCustomer(id: String): Promise<GetCustomerMetadata> {
        try {
            let existingMetadata: GetCustomerMetadata = await customerDataCache.getCustomer(id);
            if (existingMetadata) {
                console.log('Cache Hit: Customer [ customerId: ' + id + ' ]');
                return existingMetadata;
            } else {
                console.log('Cache Miss: Customer [ customerId: ' + id + ' ]');
                existingMetadata = await customerData.getCustomer(id);
                await customerDataCache.populateData(existingMetadata);
                return existingMetadata;
            }
        } catch (error: any) {
            throw error;   
        }
    }

}