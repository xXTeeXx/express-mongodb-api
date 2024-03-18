const express = require('express')
const cors = require('cors')
const app = express()
const port = 3000

app.use(cors())
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

const { MongoClient } = require("mongodb");
const uri = "mongodb://myUserAdmin:myUserAdmin@localhost:27017";

app.post('/users', async (req, res) => {
    const user = req.body;
    const client = new MongoClient(uri);
    await client.connect();
    
    // ค้นหา ID ที่สูงที่สุด
    const maxIdUser = await client.db('mydb').collection('users').find().sort({ id: -1 }).limit(1).toArray();
    let maxId = 0;
    if (maxIdUser.length > 0) {
      maxId = maxIdUser[0].id;
    }
  
    // สร้างผู้ใช้งานใหม่โดยเพิ่ม 1 หลังจาก ID สูงสุด
    const newUser = {
      id: maxId + 1,
      fname: user.fname,
      lname: user.lname,
      username: user.username,
      email: user.email,
      avatar: user.avatar
    };
  
    // เพิ่มผู้ใช้งานใหม่ลงในฐานข้อมูล
    await client.db('mydb').collection('users').insertOne(newUser);
    
    await client.close();
    res.status(200).send({
      "status": "ok",
      "message": "User with ID = " + newUser.id + " is created",
      "user": newUser
    });
  });
  

app.get('/users', async(req, res) => {
    const id = parseInt(req.params.id);
    const client = new MongoClient(uri);
    await client.connect();
    const users = await client.db('mydb').collection('users').find({}).toArray();
    await client.close();
    res.status(200).send(users);
  })

  app.get('/users/:id', async(req, res) => {
    const id = parseInt(req.params.id);
    const client = new MongoClient(uri);
    await client.connect();
    const user = await client.db('mydb').collection('users').findOne({"id": id});
    await client.close();
    res.status(200).send({
      "status": "ok",
      "user": user
    });
  })

  app.put('/users/update', async(req, res) => {
    const user = req.body;
    const id = parseInt(user.id);
    const client = new MongoClient(uri);
    await client.connect();
    await client.db('mydb').collection('users').updateOne({'id': id}, {"$set": {
      id: parseInt(user.id),
      fname: user.fname,
      lname: user.lname,
      username: user.username,
      email: user.email,
      avatar: user.avatar
    }});
    await client.close();
    res.status(200).send({
      "status": "ok",
      "message": "User with ID = "+id+" is updated",
      "user": user
    });
  })

  app.delete('/users/delete', async(req, res) => {
    const id = parseInt(req.body.id);
    const client = new MongoClient(uri);
    await client.connect();
    await client.db('mydb').collection('users').deleteOne({'id': id});
    await client.close();
    res.status(200).send({
      "status": "ok",
      "message": "User with ID = "+id+" is deleted"
    });
  })