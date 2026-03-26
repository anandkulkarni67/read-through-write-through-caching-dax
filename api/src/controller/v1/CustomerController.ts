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
import { UpdateCustomerMetadata } from "../../model/data/UpdateCustomerMetadata";
import { customerServiceCacheAside } from "../../service/business-logic/customer/Customer.bls.cache-aside";
import { customerServiceWriteThrough } from "../../service/business-logic/customer/Customer.bls.write-through";
import { GetCustomerMetadata } from "../../model/data/GetCustomerMetadata";
import { CreateCustomerMetadata } from "../../model/data/CreateCustomerMetadata";

@Tags("Customers")
@Route("/v1/customers")
export class CustomerController extends Controller {

  @Get('{id}')
  public async getCustomer(
    @Path() id: string
  ): Promise<GetCustomerMetadata> {
    this.setStatus(200);
    return customerServiceWriteThrough.getCustomer(id);
  }

  @Post()
  public async createCustomer(
    @Body() CustomerMetadata: CreateCustomerMetadata
  ): Promise<GetCustomerMetadata> {
    this.setStatus(200);
    return customerServiceWriteThrough.addCustomer(CustomerMetadata);
  }

  @Put('{id}')
  public async updateCustomer(
    @Path() id: string,
    @Body() CustomerMetadata: UpdateCustomerMetadata
  ): Promise<GetCustomerMetadata> {
    this.setStatus(200);
    return customerServiceWriteThrough.updateCustomer(id, CustomerMetadata);
  }

  @Delete('{id}')
  public async deleteCustomer(
    @Path() id: string,
    @Query() version: number
  ): Promise<void> {
    this.setStatus(200);
    return customerServiceWriteThrough.deleteCustomer(id, version);
  }
}