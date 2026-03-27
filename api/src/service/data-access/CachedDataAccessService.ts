import { GetCustomerMetadata } from "../../model/data/customer/GetCustomerMetadata";

export interface CachedDataAccessService {

    populateData(metadata: GetCustomerMetadata): Promise<void>;

    flush(): Promise<void>;

}