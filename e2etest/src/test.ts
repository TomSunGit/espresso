import { Builder, By, until } from "selenium-webdriver";
import { Options, ServiceBuilder } from "selenium-webdriver/firefox";

jest.setTimeout(100000);

describe("e2etest", () => {
    test("switch on", async () => {
        const options = new Options();
        options.headless();
        const driverPath = process.env.GeckoWebDriver && `${process.env.GeckoWebDriver}\\geckodriver.exe`;
        const serviceBuilder = new ServiceBuilder(driverPath);
        const driver = await new Builder()
            .forBrowser("firefox")
            .setFirefoxOptions(options)
            .setFirefoxService(serviceBuilder)
            .build();
        try {
            const testUrl = process.env.testurl ?
                process.env.testurl :
                "https://espressopitest.z6.web.core.windows.net/";
            await driver.get(testUrl);
            const status = driver.findElement(By.css("#status"));
            await driver.findElement(By.tagName("Button"))
                .click();
            await driver.wait(until.elementTextMatches(status, /.+/), 10000);
            const statusText = await status.getText();
            expect(statusText)
                .toBe("Maschine an");
        } finally {
            await driver.quit();
        }
    });
});
