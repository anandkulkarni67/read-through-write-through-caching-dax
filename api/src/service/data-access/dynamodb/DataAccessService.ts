import { UniqueIdentifierMetadata } from "../../../model/data/UniqueIdentifierMetadata";
import { VersionedMetadata } from "../../../model/data/VersionedMetadata";


export interface DataAccessService<T1 extends number | string, T3, T4> {

    addCustomer<T2 extends UniqueIdentifierMetadata<T1> & VersionedMetadata & T3>(metadata: T2): Promise<T4>;
    
    updateCustomer<T2 extends UniqueIdentifierMetadata<T1> & VersionedMetadata & T3>(id: T1, metadata: T2): Promise<T4>;

    deleteCustomer(id: T1, version: number): Promise<void>;

    getCustomer(id: T1): Promise<T4>;

}