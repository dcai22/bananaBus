import express, { json, Request, Response } from 'express';
import cors from 'cors';

const app = express();
const port = 3000;

app.use(json());
app.use(cors());

// Routes
app.get('/', (req: Request, res: Response) => {
    res.send('Hello world');
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});