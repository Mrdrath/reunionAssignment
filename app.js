const express = require('express');
const mongoose = require('mongoose');
const config = require('./config');
const authenticationMiddleware = require('./middleware/verifyToken.js');
const authenticationRoutes = require('./routes/auth.js');
const postRoutes = require('./routes/posts');
const userRoutes = require('./routes/users');

const app = express();

// Set up middleware
app.use(express.json());
app.use(authenticationMiddleware);

// Set up routes
app.use('/api/authenticate', authenticationMiddleware);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);

// Connect to database
mongoose.connect(config.mongodbUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(config.port, () => console.log(`Server started on port ${config.port}`));
    })
    .catch(err => console.error('Error connecting to MongoDB', err));
