import { UniqueIdentifierMetadata } from "../../../model/data/UniqueIdentifierMetadata";
import { VersionedMetadata } from "../../../model/data/VersionedMetadata";
import { CachedDataAccessService } from "../CachedDataAccessService";


export interface DataAccessService<T1 extends number | string, T3, T4> extends CachedDataAccessService {

    addCustomer<T2 extends UniqueIdentifierMetadata<T1> & VersionedMetadata & T3>(metadata: T2): Promise<void>;
    
    updateCustomer<T2 extends UniqueIdentifierMetadata<T1> & VersionedMetadata & T3>(id: T1, metadata: T2): Promise<void>;
            
    deleteCustomer(customerId: T1): Promise<void>;
    
    getCustomer(customerId: T1): Promise<T4>;

}