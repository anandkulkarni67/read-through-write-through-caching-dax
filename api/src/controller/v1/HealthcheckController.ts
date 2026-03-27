import {
  Controller,
  Get,
  Route,
  Tags
} from "tsoa";
import { Status } from '../../model/data/healthcheck/Status';
import { ServiceStatusValue } from '../../model/data/healthcheck/ServiceStatusValue';
import { Service } from '../../model/data/healthcheck/Service';
import { getEnvironment } from '../../util/environment';

@Tags("Healthcheck")
@Route("/v1/healthcheck")
export class HealthcheckController extends Controller {

  @Get('/app')
  public async getAppHealth(): Promise<Status> {
    this.setStatus(200);
    return {
              service: Service.APPLICATION,
              status: ServiceStatusValue.UP,
              metadata: {
                environemnt: getEnvironment(),
                cachingTechnique: process.env.CACHING_TECHNIQUE,
                cacheDataTTLSeconds: process.env.IN_MEMORY_CACHE_TTL_SECONDS,
                permanentDataStoreDataTTLDays: process.env.DYNAMO_DB_TTL_DAYS
              }
            }
    }
}