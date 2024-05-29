import "dotenv/config";
import app from "./app";

const port = process.env.PORT || 3000;

// main app
app.use(app);

// starting the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
