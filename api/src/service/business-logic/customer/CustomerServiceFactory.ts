import { CachingTechniqueType } from "../../../model/data/CachingTechniqueType";
import { CustomerService } from "./CustomerService";
import { CustomerServiceCacheAside } from "./CustomerServiceCacheAside";
import { CustomerServiceReadThrough } from "./CustomerServiceReadThrough";
import { CustomerServiceWriteThrough } from "./CustomerServiceWriteThrough";
import { CustomerServiceWriteBehind } from "./CustomerServiceWriteBehind";

export class CustomerServiceCachingTechniquesFactory {

    static customerService: CustomerService<string>;

    public static  getCustomerServiceInstance(): CustomerService<string> {
        if (this.customerService) {
            return this.customerService;
        } else {
            switch(process.env.CACHING_TECHNIQUE) {
            case CachingTechniqueType.CACHE_ASIDE:
                this.customerService = new CustomerServiceCacheAside();
                break;
            case CachingTechniqueType.READ_THROUGH:
                this.customerService =  new CustomerServiceReadThrough();
                break;
            case CachingTechniqueType.WRITE_BEHIND:
                this.customerService =  new CustomerServiceWriteBehind();
                break;
            case CachingTechniqueType.WRITE_THROUGH: 
                this.customerService =  new CustomerServiceWriteThrough();
                break;
            default:
                throw new Error("Unknown Caching Technique !"); 
        }
            return this.customerService;
        }
    }

}