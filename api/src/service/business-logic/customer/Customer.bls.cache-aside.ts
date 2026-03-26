import { UpdateCustomerMetadata } from '../../../model/data/UpdateCustomerMetadata';
import { GetCustomerMetadata } from '../../../model/data/GetCustomerMetadata';
import { CreateCustomerMetadata } from '../../../model/data/CreateCustomerMetadata';
import { customerDataAceessService } from '../../data-access/customer/Customer.das';

const NodeCache = require( "node-cache" );
const customerDataCache = new NodeCache( { stdTTL: 100, checkperiod: 120 } );

// Cache-Aside caching technique implementation.
class CustomerServiceCacheAside {

    public async addCustomer(metadata: CreateCustomerMetadata): Promise<GetCustomerMetadata> {
        try {
            const customerMetadata = await customerDataAceessService.addCustomer(metadata);
            return customerMetadata;
        } catch (error: any) {
            throw error;
        }
    }

    public async updateCustomer(customerId: string, metadata: UpdateCustomerMetadata): Promise<GetCustomerMetadata> {
        try {
            const customerMetadata = await customerDataAceessService.updateCustomer(customerId, metadata);
            customerDataCache.delete(customerId);
            return customerMetadata;
        } catch (error: any) {
            throw error;
        }
    }

    public async deleteCustomer(customerId: String, version: number): Promise<void> {
        try {
            await customerDataAceessService.deleteCustomer(customerId, version);
            customerDataCache.delete(customerId);
        } catch (error: any) {
            throw error;
        }
    }

    public async getCustomer(customerId: String): Promise<GetCustomerMetadata> {
        try {
            let customerMetadata: GetCustomerMetadata = customerDataCache.get(customerId);
            if (customerMetadata) {
                console.log('Cache Hit: Customer [ customerId: ' + customerId + ' ]');
                return customerMetadata;
            } else {
                console.log('Cache Miss: Customer [ customerId: ' + customerId + ' ]');
                customerMetadata = await customerDataAceessService.getCustomer(customerId);
                customerDataCache.set(customerId, customerMetadata, process.env.IN_MEMORY_CACHE_TTL_SECONDS);
                return customerMetadata;
            }
        } catch (error: any) {
            throw error;   
        }
    }

}

export const customerServiceCacheAside = new CustomerServiceCacheAside();