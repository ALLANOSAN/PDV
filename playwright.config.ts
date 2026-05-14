import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
    testDir: "./tests/e2e",
    timeout: 30 * 1000,
    retries: 0,
    use: {
        baseURL: "http://localhost:5173", // ajuste se sua porta for diferente
        trace: "on-first-retry",
        screenshot: "only-on-failure",
        video: "retain-on-failure",
        ...devices["Desktop Chrome"],
    },
});
