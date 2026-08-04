import app from "./app.js";
import { env } from "./config/env.js";

app.listen(env.PORT, () => {
  console.log("==================================");
  console.log("🚀 Elaris-One Server Started");
  console.log(`🌐 http://localhost:${env.PORT}`);
  console.log("==================================");
});