import { UpdateCustomerMetadata } from '../../../model/data/UpdateCustomerMetadata';
import { dynamoDBDocumentClient } from '../../../util/awsUtil';
import { daysinFuture } from '../../../util/dataTime';
import { PutCommand, UpdateCommand, DeleteCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from 'crypto';
import { NotFound } from '../../../model/error/NotFound';
import { ResourceConflict } from '../../../model/error/ResourceConflict';
import { GetCustomerMetadata } from '../../../model/data/GetCustomerMetadata';
import { CreateCustomerMetadata } from '../../../model/data/CreateCustomerMetadata';

class CustomerDataAccessService {

    public async addCustomer(metadata: CreateCustomerMetadata): Promise<GetCustomerMetadata> {
        try {
            const customerId = randomUUID();
            const customerMetadata = {
                ...metadata,
                customerId,
                version: 1
            };
            const command = new PutCommand({
                TableName: process.env.CUSTOMER_TABLE_NAME,
                Item: {
                    CustomerId: customerId,
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

    public async updateCustomer(customerId: string, metadata: UpdateCustomerMetadata): Promise<GetCustomerMetadata> {
        try {
            const customerMetadata = {
                ...metadata,
                customerId,
                version: metadata.version + 1
            };
            const command = new UpdateCommand({
                TableName: process.env.CUSTOMER_TABLE_NAME,
                Key: {
                    CustomerId: customerId,
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
                        throw new ResourceConflict('State conflict for the Customer record [ customerId: ' + customerId + ' ]')
                    }
                } else {
                    throw new NotFound('Customer with [ customerId: ' + customerId + ' ] not found.');
                }
            }
            throw error;
        }
    }

    public async deleteCustomer(customerId: String, version: number): Promise<void> {
        try {
            const command = new DeleteCommand({
                TableName: process.env.CUSTOMER_TABLE_NAME,
                Key: {
                    CustomerId: customerId
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
                        throw new ResourceConflict('State conflict for the Customer record [ customerId: ' + customerId + ' ]')
                    }
                } else {
                    throw new NotFound('Customer with [ customerId: ' + customerId + ' ] not found.');
                }
            }
            throw error;
        }
    }

    public async getCustomer(customerId: String): Promise<GetCustomerMetadata> {
        try {
            const command = new GetCommand({
                TableName: process.env.CUSTOMER_TABLE_NAME,
                Key: {
                    CustomerId: customerId
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
            throw new NotFound('Customer [id: ' + customerId + '] not found.');
        } catch (error: any) {
            throw error;   
        }
    }

}

export const customerDataAceessService = new CustomerDataAccessService();