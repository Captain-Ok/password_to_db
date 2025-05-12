const express = require('express');
const { MongoClient} = require('mongodb');
require('dotenv').config();
const bodyparser = require('body-parser');
const cors = require('cors');

// Use environment variable for MongoDB URL or fallback to localhost
const url = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new MongoClient(url);

// Database Name
const dbName = 'passwordManager';
const app = express();
const port = process.env.PORT || 3000;
app.use(bodyparser.json());
app.use(cors());

// Connect to MongoDB with proper error handling
const connectMongo = async () => {
    try {
        await client.connect();
        console.log('Connected successfully to MongoDB');
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        process.exit(1);
    }
}
connectMongo();

// Handle graceful shutdown
process.on('SIGINT', async () => {
    await client.close();
    console.log('MongoDB connection closed');
    process.exit(0);
});

// Get all the passwords
app.get('/', async (req, res) => {
    try {
        const db = client.db(dbName);
        const collection = db.collection('passwords');
        const finalResult = await collection.find({}).toArray();
        res.json(finalResult);
    } catch (error) {
        console.error('Error fetching passwords:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch passwords' });
    }
})

// Save a password
app.post('/', async (req, res) => {
    try {
        const password = req.body;
        const db = client.db(dbName);
        const collection = db.collection('passwords');
        const finalResult = await collection.insertOne(password);
        res.send({success: true, result: finalResult});
    } catch (error) {
        console.error('Error saving password:', error);
        res.status(500).json({ success: false, error: 'Failed to save password' });
    }
})

// Delete Passwords
app.delete('/', async (req, res) => {
    try {
        const password = req.body;
        const db = client.db(dbName);
        const collection = db.collection('passwords');
        const finalResult = await collection.deleteOne(password);
        res.send({success: true, result: finalResult});
    } catch (error) {
        console.error('Error deleting password:', error);
        res.status(500).json({ success: false, error: 'Failed to delete password' });
    }
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})