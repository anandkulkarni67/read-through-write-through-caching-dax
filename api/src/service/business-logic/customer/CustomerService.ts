import { CustomerMetadata } from "../../../model/data/customer/CustomerMetadata";
import { GetCustomerMetadata } from "../../../model/data/customer/GetCustomerMetadata";
import { UniqueIdentifierMetadata } from "../../../model/data/UniqueIdentifierMetadata";
import { VersionedMetadata } from "../../../model/data/VersionedMetadata";


export interface CustomerService<T1 extends number | string> {

    addCustomer<T2 extends CustomerMetadata>(metadata: T2): Promise<GetCustomerMetadata>;

    updateCustomer<T2 extends VersionedMetadata & CustomerMetadata>(id: T1, metadata: T2): Promise<GetCustomerMetadata>;

    deleteCustomer(id: T1, version: number): Promise<void>;

    getCustomer(id: T1): Promise<GetCustomerMetadata>;

}