/*import { defineConfig } from '@playwright/test';
import 'dotenv/config';

export default defineConfig({
    testDir: './tests',
    timeout: 60_000,
    retries: process.env.CI ? 1 : 0,
    reporter: [['list'], ['junit', { outputFile: 'results/junit-results.xml' }]],
    use: {
        baseURL: process.env.SONAR_URL || 'http://localhost:9000',
        screenshot: 'only-on-failure',
    },
});
 */

// playwright.config.ts
/*import { defineConfig } from '@playwright/test';
import 'dotenv/config';

const SAUCE_USER = process.env.SAUCE_USERNAME;
const SAUCE_KEY  = process.env.SAUCE_ACCESS_KEY;
const SAUCE_CAPS = encodeURIComponent(JSON.stringify({
    browserName: 'chrome',
    browserVersion: 'latest',
    platformName: 'Windows 10',
    'sauce:options': {
        username: SAUCE_USER,
        accessKey: SAUCE_KEY,
        build: process.env.BUILD_NUMBER || 'local-build',
        name: 'SonarQube Vulnerability Coverage',
    },
}));

export default defineConfig({
    testDir: './tests',
    timeout: 60_000,
    reporter: [['list'], ['junit', { outputFile: 'results/junit-results.xml' }]],
    use: {
        baseURL: process.env.APP_URL || 'https://www.saucedemo.com',
        connectOptions: {
            wsEndpoint: `wss://ondemand.us-west-1.saucelabs.com/playwright/cdp?caps=${SAUCE_CAPS}`,
        },
    },
});
*/
