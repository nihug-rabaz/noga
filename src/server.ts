import { NogaApp } from "./app";
import { EnvConfig } from "./config/env";

const env = EnvConfig.getInstance();
const port = env.getPort();

const nogaApp = new NogaApp();
const app = nogaApp.getExpressInstance();

app.listen(port, () => {
  process.stdout.write(`noga server listening on port ${port}\n`);
});

