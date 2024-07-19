const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require("dotenv").config();

const tasksRoutes = require('./routes/tasks-routes');
const usersRoutes = require('./routes/users-routes')
const HttpError = require('./models/http-error');

const app = express();

app.use(cors());

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));  

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers', 
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader('Access-Control-Allow-Headers', 'GET, POST, PATCH, DELETE');
    next();
});

app.use('/api/tasks', tasksRoutes);
app.use('/api/users', usersRoutes);

app.use((req, res, next) => { 
    const error = new HttpError('Could not find this route.', 404);
    throw error;
});

app.use((error, req, res, next) => {
    if (res.headerSent) {
        return next(error);
    }

    let statusCode = 500;

    if (error.statusCode) {
        statusCode = error.statusCode;
    }

    res.status(statusCode);
    res.json({ message: error.message || 'An unknown error occurred!' });
});

const port = process.env.PORT 

mongoose
    .connect(
        'mongodb+srv://zman193066:123456788@cluster0.cfyk1bl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
    )
    .then(() => {
        app.listen(process.env.port); 
        console.log("Server is running on port http://localhost:5000/")
    })
    .catch((err) => {
        console.log(err);
    });
