import { dynamoDBDocumentClient } from '../../../../util/awsUtil';
import { daysinFuture } from '../../../../util/dataTime';
import { PutCommand, UpdateCommand, DeleteCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { GetCustomerMetadata } from '../../../../model/data/customer/GetCustomerMetadata';
import { NotFound } from '../../../../model/error/NotFound';
import { DataAccessServiceWriteBehindCaching } from '../DataAccessServiceWriteBehindCaching';
import { CustomerMetadata } from '../../../../model/data/customer/CustomerMetadata';
import { UpdateCustomerMetadata } from '../../../../model/data/customer/UpdateCustomerMetadata';

class CustomerDataAccessServiceWriteBehindCaching implements DataAccessServiceWriteBehindCaching<string, CustomerMetadata, GetCustomerMetadata> {

    public async addCustomer(metadata: GetCustomerMetadata): Promise<void> {
        try {
            const command = new PutCommand({
                TableName: process.env.CUSTOMER_TABLE_NAME,
                Item: {
                    CustomerId: metadata.id,
                    Metadata: metadata,
                    Version: metadata.version,
                    Ttl: daysinFuture(Number(process.env.DYNAMO_DB_TTL_DAYS))
                }
            });
            await dynamoDBDocumentClient.send(command);
        } catch (error: any) {
            console.log(error.message);
        }
    }

    public async updateCustomer(id: string, metadata: UpdateCustomerMetadata): Promise<void> {
        try {
            const command = new UpdateCommand({
                TableName: process.env.CUSTOMER_TABLE_NAME,
                Key: {
                    CustomerId: id,
                },
                UpdateExpression: "set Version = :newversion, metadata = :metadata", // optimitstic locking using version checks.
                ConditionExpression: "Version = :currentVersion",
                ExpressionAttributeValues: {
                    ":metadata": metadata,
                    ":newversion": metadata.version,
                    ":currentVersion": metadata.version - 1
                },
                ReturnValuesOnConditionCheckFailure: "ALL_OLD"
            });
            const data = await dynamoDBDocumentClient.send(command);
        } catch (error: any) {
            if (error.message && error.message == 'The conditional request failed') {
                if (error.Item) {
                    if ( error.Item.Version.N != metadata.version) {
                        console.log('State conflict for the Customer record [ id: ' + id + ' ]');
                    }
                } else {
                    console.log('Customer with [ id: ' + id + ' ] not found.');
                }
            }
            console.log(error.message);
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
                        console.log('State conflict for the Customer record [ id: ' + id + ' ]')
                    }
                } else {
                    console.log('Customer with [ id: ' + id + ' ] not found.');
                }
            }
            console.log(error.message);
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
                return customerMetadata as GetCustomerMetadata;
            }
            throw new NotFound('Customer [id: ' + id + '] not found.');
        } catch (error: any) {
            throw error;
        }
    }

}

export const customerDataAccessServiceWriteBehindCaching = new CustomerDataAccessServiceWriteBehindCaching();