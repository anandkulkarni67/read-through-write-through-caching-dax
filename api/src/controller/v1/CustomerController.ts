import {
  Body,
  Controller,
  Get,
  Put,
  Delete,
  Path,
  Post,
  Query,
  Route,
  Tags
} from "tsoa";
import { UpdateCustomerMetadata } from "../../model/data/customer/UpdateCustomerMetadata";
import { GetCustomerMetadata } from "../../model/data/customer/GetCustomerMetadata";
import { CreateCustomerMetadata } from "../../model/data/customer/CreateCustomerMetadata";
import { CustomerService } from "../../service/business-logic/customer/CustomerService";
import { CustomerServiceCachingTechniquesFactory } from "../../service/business-logic/customer/CustomerServiceFactory";

@Tags("Customers")
@Route("/v1/customers")
export class CustomerController extends Controller {

  customerService: CustomerService<string>;

  constructor() {
    super();
    this.customerService = CustomerServiceCachingTechniquesFactory.getCustomerServiceInstance();
  }

  @Get('{id}')
  public async getCustomer(
    @Path() id: string
  ): Promise<GetCustomerMetadata> {
    this.setStatus(200);
    return this.customerService.getCustomer(id);
  }

  @Post()
  public async createCustomer(
    @Body() CustomerMetadata: CreateCustomerMetadata
  ): Promise<GetCustomerMetadata> {
    this.setStatus(200);
    return this.customerService.addCustomer(CustomerMetadata);
  }

  @Put('{id}')
  public async updateCustomer(
    @Path() id: string,
    @Body() CustomerMetadata: UpdateCustomerMetadata
  ): Promise<GetCustomerMetadata> {
    this.setStatus(200);
    return this.customerService.updateCustomer(id, CustomerMetadata);
  }

  @Delete('{id}')
  public async deleteCustomer(
    @Path() id: string,
    @Query() version: number
  ): Promise<void> {
    this.setStatus(200);
    return this.customerService.deleteCustomer(id, version);
  }
}