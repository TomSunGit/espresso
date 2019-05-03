import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { Client } from "azure-iothub";

const deviceId = "espressoPi";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    if (req.query.on === undefined && req.query.off === undefined) {
        context.res = {
            body: "missing on or off query string",
            status: 404,
        };

        return;
    }
    if (!process.env.APPSETTING_IOTHUB_CONNECTION_STRING) {
        throw new Error("Found no connection string in key vault");
    }
    const client = Client.fromConnectionString(process.env.APPSETTING_IOTHUB_CONNECTION_STRING);

    const methodParams = {
        methodName: req.query.off !== undefined ? "onSwitchOff" : "onSwitchOn",
    };
    try {
        const result = await client.invokeDeviceMethod(deviceId, methodParams);

        context.res = {
            body: result.result.payload,
            status: result.result.status,
        };
    } catch (err) {
        context.log.error(`Failed to invoke method "${methodParams.methodName}" with error: "${err.message}"`, err);
        context.res = {
            body: "Failed to invoke method",
            status: 500,
        };
    }
    // context.log('HTTP trigger function processed a request.');
    // const name = (req.query.name || (req.body && req.body.name));

    // if (name) {
    //     context.res = {
    //         // status: 200, /* Defaults to 200 */
    //         body: "Hello " + (req.query.name || req.body.name)
    //     };
    // }
    // else {
    //     context.res = {
    //         status: 400,
    //         body: "Please pass a name on the query string or in the request body"
    //     };
    // }
};

export default httpTrigger;
