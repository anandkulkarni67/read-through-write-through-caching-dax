import { UpdateCustomerMetadata } from '../../../../model/data/customer/UpdateCustomerMetadata';
import { dynamoDBDocumentClient } from '../../../../util/awsUtil';
import { daysinFuture } from '../../../../util/dataTime';
import { PutCommand, UpdateCommand, DeleteCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from 'crypto';
import { NotFound } from '../../../../model/error/NotFound';
import { ResourceConflict } from '../../../../model/error/ResourceConflict';
import { GetCustomerMetadata } from '../../../../model/data/customer/GetCustomerMetadata';
import { CreateCustomerMetadata } from '../../../../model/data/customer/CreateCustomerMetadata';
import { DataAccessService } from '../DataAccessService';
import { CustomerMetadata } from '../../../../model/data/customer/CustomerMetadata';

class CustomerDataAccessService implements DataAccessService<string, CustomerMetadata, GetCustomerMetadata> {

    public async addCustomer(metadata: CreateCustomerMetadata): Promise<GetCustomerMetadata> {
        try {
            const id = randomUUID();
            const customerMetadata = {
                ...metadata,
                id,
                version: 1
            };
            const command = new PutCommand({
                TableName: process.env.CUSTOMER_TABLE_NAME,
                Item: {
                    CustomerId: id,
                    Metadata: customerMetadata,
                    Version: customerMetadata.version,
                    Ttl: daysinFuture(Number(process.env.DYNAMO_DB_TTL_DAYS))
                }
            });
            await dynamoDBDocumentClient.send(command);
            return customerMetadata;
        } catch (error: any) {
            throw error;
        }
    }

    public async updateCustomer(id: string, metadata: UpdateCustomerMetadata): Promise<GetCustomerMetadata> {
        try {
            const customerMetadata = {
                ...metadata,
                id,
                version: metadata.version + 1
            };
            const command = new UpdateCommand({
                TableName: process.env.CUSTOMER_TABLE_NAME,
                Key: {
                    CustomerId: id,
                },
                UpdateExpression: "set Version = :newversion, metadata = :metadata", // optimitstic locking using version checks.
                ConditionExpression: "Version = :currentVersion",
                ExpressionAttributeValues: {
                    ":metadata": customerMetadata,
                    ":newversion": metadata.version + 1,
                    ":currentVersion": metadata.version
                },
                ReturnValuesOnConditionCheckFailure: "ALL_OLD"
            });
            const data = await dynamoDBDocumentClient.send(command);
            return customerMetadata;
        } catch (error: any) {
            if (error.message && error.message == 'The conditional request failed') {
                if (error.Item) {
                    if ( error.Item.Version.N != metadata.version) {
                        throw new ResourceConflict('State conflict for the Customer record [ id: ' + id + ' ]')
                    }
                } else {
                    throw new NotFound('Customer with [ id: ' + id + ' ] not found.');
                }
            }
            throw error;
        }
    }

    public async deleteCustomer(id: String, version: number): Promise<void> {
        try {
            const command = new DeleteCommand({
                TableName: process.env.CUSTOMER_TABLE_NAME,
                Key: {
                    CustomerId: id
                },
                ConditionExpression: "Version = :currentVersion", // optimitstic locking using version checks.
                ExpressionAttributeValues: {
                    ":currentVersion": version
                },
                ReturnValuesOnConditionCheckFailure: "ALL_OLD"
            });
            await dynamoDBDocumentClient.send(command);
        } catch (error: any) {
            if (error.message && error.message == 'The conditional request failed') {
                if (error.Item) {
                    if ( error.Item.Version.N != version) {
                        throw new ResourceConflict('State conflict for the Customer record [ id: ' + id + ' ]');
                    }
                } else {
                    throw new NotFound('Customer with [ id: ' + id + ' ] not found.');
                }
            }
            throw error;
        }
    }

    public async getCustomer(id: String): Promise<GetCustomerMetadata> {
        try {
            const command = new GetCommand({
                TableName: process.env.CUSTOMER_TABLE_NAME,
                Key: {
                    CustomerId: id
                }
            });
            const data = await dynamoDBDocumentClient.send(command);
            if (data.Item) {
                const customerMetadata = {
                    ...data.Item.Metadata,
                    version: data.Item.Version
                };
                return customerMetadata;
            }
            throw new NotFound('Customer [id: ' + id + '] not found.');
        } catch (error: any) {
            throw error;   
        }
    }

}

export const customerDataAccessService = new CustomerDataAccessService();