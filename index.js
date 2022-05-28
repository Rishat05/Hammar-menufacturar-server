const express = require('express');
const cors = require('cors');
require('dotenv').config();
var jwt = require('jsonwebtoken');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;


//middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zgbvl.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'UnAuthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' })
        }
        req.decoded = decoded;
        next();
    });
}
async function run() {
    try {
        await client.connect();
        const serviceCollection = client.db('hammerMenufacturer').collection('tools');
        const bookingCollection = client.db('hammerMenufacturer').collection('bookings');
        const userCollection = client.db("hammerMenufacturer").collection("users");
        const adminCollection = client.db("hammerMenufacturer").collection("admin");

        app.get('/tools', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        });

        // app.post('/login', async (req, res) => {
        //     const email = req.body;
        //     const token = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET);
        //     res.send({ token });
        // });

        app.get('/tools/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const item = await serviceCollection.findOne(query);
            res.send(item);
        });

        app.post('/booking', verifyJWT, async (req, res) => {
            const booking = req.body;
            const result = await bookingCollection.insertOne(booking);
            res.send(result);
        });
        // no use 
        app.get('/booking', async (req, res) => {
            const query = {};
            const cursor = bookingCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        });

        app.get('/booking/:email', verifyJWT, async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const result = await bookingCollection.find(query).toArray();
            res.send(result);
        });

        app.delete('/booking/dlt/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await bookingCollection.deleteOne(query);
            res.send(result);
        });

        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email };
            const option = { upsert: true };
            const updateDoc = {
                $set: user
            };
            const result = await userCollection.updateOne(filter, updateDoc, option);
            const token = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
            res.send({ result, token });
        });

        app.put('/userupdate/:email', verifyJWT, async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email };
            const option = { upsert: true };
            const updateDoc = {
                $set: user
            };
            const result = await userCollection.updateOne(filter, updateDoc, option);
            res.send(result);
        })

        app.get('/userprofile/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const result = await userCollection.findOne(query);
            res.send(result);
        });

        app.get('/allusers', async (req, res) => {
            const query = {};
            const result = await userCollection.find(query).toArray();
            res.send(result);
        });

        app.delete('/allusers/dlt/:email', verifyJWT, async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const result = userCollection.deleteOne(query);
            res.send(result);
        });

    }

    finally {

    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Running Rishat hammer manufacturer');
});

app.listen(port, () => {
    console.log('listening to port', port);
});

