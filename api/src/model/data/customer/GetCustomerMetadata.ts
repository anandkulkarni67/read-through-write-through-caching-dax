import { CustomerMetadata } from "./CustomerMetadata";
import { VersionedMetadata } from "../VersionedMetadata";
import { UniqueIdentifierMetadata } from "../UniqueIdentifierMetadata";

export interface GetCustomerMetadata extends CustomerMetadata, VersionedMetadata, UniqueIdentifierMetadata<string> {
}