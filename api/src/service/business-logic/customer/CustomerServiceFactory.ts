import { CachingTechniqueType } from "../../../model/data/CachingTechniqueType";
import { CustomerService } from "./CustomerService";
import { CustomerServiceCacheAside } from "./CustomerServiceCacheAside";
import { CustomerServiceReadThrough } from "./CustomerServiceReadThrough";
import { CustomerServiceWriteThrough } from "./CustomerServiceWriteThrough";
import { CustomerServiceWriteBehind } from "./CustomerServiceWriteBehind";

export class CustomerServiceCachingTechniquesFactory {

    public static  getCustomerServiceInstance(): CustomerService<string> {
        let customerService = undefined;
        switch(process.env.CACHING_TECHNIQUE) {
            case CachingTechniqueType.CACHE_ASIDE:
                customerService = new CustomerServiceCacheAside();
                break;
            case CachingTechniqueType.READ_THROUGH:
                customerService =  new CustomerServiceReadThrough();
                break;
            case CachingTechniqueType.WRITE_BEHIND:
                customerService =  new CustomerServiceWriteBehind();
                break;
            case CachingTechniqueType.WRITE_THROUGH: 
                customerService =  new CustomerServiceWriteThrough();
                break;
            default:
                throw new Error("Unknown Caching Technique !"); 
        }
        return customerService;
    }

}