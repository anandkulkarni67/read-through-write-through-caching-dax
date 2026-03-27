import { CreateCustomerMetadata } from "../../../model/data/customer/CreateCustomerMetadata";
import { GetCustomerMetadata } from "../../../model/data/customer/GetCustomerMetadata";
import { UpdateCustomerMetadata } from "../../../model/data/customer/UpdateCustomerMetadata";
import { CachedDataAccessService } from "../CachedDataAccessService";


export interface DataAccessServiceWriteBehindCaching extends CachedDataAccessService {

    addCustomer(metadata: CreateCustomerMetadata): Promise<GetCustomerMetadata>;
    
    updateCustomer(id: string, metadata: UpdateCustomerMetadata): Promise<GetCustomerMetadata>;
            
    deleteCustomer(customerId: String, version: number): Promise<void>;
    
    getCustomer(customerId: String): Promise<GetCustomerMetadata>;

}