import { UpdateCustomerMetadata } from '../../../model/data/customer/UpdateCustomerMetadata';
import { GetCustomerMetadata } from '../../../model/data/customer/GetCustomerMetadata';
import { CreateCustomerMetadata } from '../../../model/data/customer/CreateCustomerMetadata';
import { customerDataAccessService as customerData } from '../../data-access/dynamodb/customer/CustomerDataAccessService';
import { customerDataAccessService as customerDataCache } from '../../data-access/inMemoryCache/customer/CustomerDataAccessService';
import { CustomerService } from './CustomerService';

// Write-Through caching technique implementation.
export class CustomerServiceWriteThrough implements CustomerService<string> {

    public async addCustomer(metadata: CreateCustomerMetadata): Promise<GetCustomerMetadata> {
        try {
            const customerMetadata = await customerData.addCustomer(metadata);
            await customerDataCache.addCustomer(customerMetadata);
            return customerMetadata;
        } catch (error: any) {
            throw error;
        }
    }

    public async updateCustomer(id: string, metadata: UpdateCustomerMetadata): Promise<GetCustomerMetadata> {
        try {
            const updatedMetadata = await customerData.updateCustomer(id, metadata);
            await customerDataCache.updateCustomer(id, updatedMetadata);
            return updatedMetadata;
        } catch (error: any) {
            throw error;
        }
    }

    public async deleteCustomer(customerId: String, version: number): Promise<void> {
        try {
            await customerData.deleteCustomer(customerId, version);
            await customerDataCache.deleteCustomer(customerId);
        } catch (error: any) {
            throw error;
        }
    }

    public async getCustomer(customerId: String): Promise<GetCustomerMetadata> {
        try {
            let existingMetadata: GetCustomerMetadata = await customerDataCache.getCustomer(customerId);
            if (existingMetadata) {
                console.log('Cache Hit: Customer [ customerId: ' + customerId + ' ]');
                return existingMetadata;
            } else {
                console.log('Cache Miss: Customer [ customerId: ' + customerId + ' ]');
                existingMetadata = await customerData.getCustomer(customerId);
                await customerDataCache.populateData(existingMetadata);
                return existingMetadata;
            }
        } catch (error: any) {
            throw error;   
        }
    }

}