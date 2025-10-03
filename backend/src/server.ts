import app from "./app";
import config from "./config";

const PORT = config.port;
app.listen(PORT, () => console.log(`API running at http://localhost:${PORT}`));
