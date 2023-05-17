const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const app = express();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@ac-wscs5t5-shard-00-00.7guimwk.mongodb.net:27017,ac-wscs5t5-shard-00-01.7guimwk.mongodb.net:27017,ac-wscs5t5-shard-00-02.7guimwk.mongodb.net:27017/?ssl=true&replicaSet=atlas-954gd2-shard-0&authSource=admin&retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const eventsCollection = client
      .db("volunteerNetworkDB")
      .collection("volunteerEvents");
    const registeredEvents = client
      .db("volunteerNetworkDB")
      .collection("registeredEvents");

    const indexKeys = { eventName: 1 };
    const indexOptions = { name: "eventNameCategory" };

    const result = await eventsCollection.createIndex(indexKeys, indexOptions);

    app.get("/eventSearch/:text", async (req, res) => {
      const searchText = req.params.text;
      const result = await eventsCollection
        .find({
          $or: [{ eventName: { $regex: searchText, $options: "i" } }],
        })
        .toArray();
      res.send(result);
    });

    app.get("/allEvents", async (req, res) => {
      const result = await eventsCollection.find().toArray();
      res.send(result);
    });

    app.post("/registeredEvents", async (req, res) => {
      const registrationData = req.body;
      console.log(registrationData);
      const result = await registeredEvents.insertOne(registrationData);
      res.send(result);
    });
    app.get("/allEvents/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: new ObjectId(id) };
      const result = await eventsCollection.findOne(filter);
      res.send(result);
    });

    app.get("/registeredEvents/:email", async (req, res) => {
      const events = await registeredEvents
        .find({email: req.params.email,})
        .toArray();
      res.send(events);
    });

    app.delete("/registeredEvents/:id", async (req, res) => { 
      const id= req.params.id;

      const query= {_id: new ObjectId(id)}
      const result= await registeredEvents.deleteOne(query)
      res.send(result);
      console.log(id)
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Volunteer network is running");
});

app.listen(port, () => {
  console.log(`Volunteer network is listening on port${port}`);
});
