import { UniqueIdentifierMetadata } from "../../../model/data/UniqueIdentifierMetadata";
import { VersionedMetadata } from "../../../model/data/VersionedMetadata";

export interface DataAccessServiceWriteBehindCaching<T1 extends number | string, T3, T4> {

    addCustomer<T2 extends UniqueIdentifierMetadata<T1> & VersionedMetadata & T3>(metadata: T2): Promise<void>;
    
    updateCustomer<T2 extends UniqueIdentifierMetadata<T1> & VersionedMetadata & T3>(id: T1, metadata: T2): Promise<void>;
            
    deleteCustomer(customerId: T1, version: number): Promise<void>;
    
    getCustomer(customerId: T1): Promise<T4>;

}