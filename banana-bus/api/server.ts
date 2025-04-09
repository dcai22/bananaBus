import { connectToDatabase } from "./mongoUtil";

const app = require("./index");
const port = 3000;

connectToDatabase().then(() => {
        // Start server
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
        }
    ).catch((err) => {
        console.error("Failed to connect to the database", err);
        process.exit(1);
    }
);
