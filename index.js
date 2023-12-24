const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use(cors());

// app.use(
//   cors({
//     origin: [
//       "https://task-management-1b682.web.app/",
//       "https://task-management-1b682.firebaseapp.com/",
//       "http://localhost:5173",
//     ],
//     credentials: true,
//   })
// );

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0vftcn5.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const dbConnect = async () => {
  try {
    client.connect();
    console.log("Database Connected Successfully✅");
  } catch (error) {
    console.log(error.name, error.message);
  }
};
dbConnect();

const database = client.db("TodoDB");
const todolist = database.collection("todo");

app.get("/task", async (req, res) => {
  const data = await todolist.find();
  const result = await data.toArray();
  res.send(result);
});

app.post("/task", async (req, res) => {
  const data = req.body;
  const defaultField = {
    action: "to-do",
  };
  const finalData = { ...data, ...defaultField };
  const result = await todolist.insertOne(finalData);
  res.send(result);
});

app.patch("/task/:id", async (req, res) => {
  const id = req.params.id;
  const updateTask = req.body;
  const query = { _id: new ObjectId(id) };
  const options = { upsert: true };
  const task = {
    $set: {
      title: updateTask.title,
      priority: updateTask.priority,
      desc: updateTask.desc,
      date: updateTask.date,
    },
  };
  const result = await todolist.updateOne(query, task, options);
  res.send(result);
});

app.patch("/task", async (req, res) => {
  const status = req.query.status;
  const id = req.query.id;
  const query = { _id: new ObjectId(id) };
  const options = { upsert: true };
  const updateStatus = {
    $set: {
      action: status,
    },
  };
  const result = await todolist.updateOne(query, updateStatus, options);
  res.send(result);
});

app.delete("/task/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await todolist.deleteOne(query);
  res.send(result);
});

app.get("/", (req, res) => {
  res.send("App is running");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
