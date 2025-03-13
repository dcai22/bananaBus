import express, { json, Request, Response } from 'express';
import cors from 'cors';

import { authLogin, authRegister } from './auth';

const app = express();
const port = 3000;

app.use(json());
app.use(cors());

// Start server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

// Routes
app.get('/', (req: Request, res: Response) => {
    res.send('Hello world');
});

// Login route
app.post('/login', (req: Request, res: Response) => {
    const email = req.body.email as string;
    const password = req.body.password as string;
    res.json(authLogin(email, password));
    return;
});
