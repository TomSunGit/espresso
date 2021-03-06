import * as appInsights from "applicationinsights";
import { results } from "azure-iot-common";
import { Client, DeviceMethodResponse } from "azure-iot-device";
import { Mqtt } from "azure-iot-device-mqtt";
import { exec } from "child_process";
import { promisify } from "util";

const log = (...args: string[]): void => {
    appInsights.defaultClient.trackTrace({message: args[0]});
    console.log(new Date().toISOString(), ...args);
};

const execAsync = promisify(exec);

async function execAndResponse(
    command: string, argument: string, description: string,
    response: DeviceMethodResponse): Promise<void> {
    const startTime = Date.now();
    log(description);
    let msg: string;
    let resultCode: number;
    try {
        await execAsync(`${command} ${argument}`);
        msg = `send ${description} to the plug socket`;
        resultCode = 200;
    } catch (e) {
        appInsights.defaultClient.trackException({exception: e});
        msg = `failed to send ${description}. Error: "${e}"`;
        resultCode = 500;
        console.error(msg);
    }
    try {
        await response.send(resultCode, msg);
    } catch (e) {
        appInsights.defaultClient.trackException({exception: e});
    }
    const duration = Date.now() - startTime;
    appInsights.defaultClient.trackRequest({
        duration,
        name: `steuerung ${argument}`,
        resultCode,
        success: resultCode === 200,
        url: `mqtts://espresso/${argument}`,
    });
}

export function init(connectionString?: string, testingCmd?: string): void {
    if (connectionString === undefined) {
        throw new Error("connectionString needs a value");
    }
    const deviceClient: Client = Client.fromConnectionString(connectionString, Mqtt);
    const command = testingCmd ? testingCmd : "steuerung";
    deviceClient.onDeviceMethod("onSwitchOn",
        (request, response) => execAndResponse(command, "1", "power on", response));
    deviceClient.onDeviceMethod("onSwitchOff",
        (request, response) => execAndResponse(command, "0", "power off", response));
    deviceClient.on("disconnect", (err: results.Disconnected) => {
        appInsights.defaultClient.trackException({exception: err.transportObj});
        log("disconnect", JSON.stringify(err));
    });

    log("Device connect to iot hub");
}
