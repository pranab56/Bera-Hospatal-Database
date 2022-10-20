const express = require('express');
const cors=require('cors')
const app=express();
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
const port =process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/',(req,res)=>{
    res.send('database is ready')
})




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.rmr1udk.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        await client.connect();
        const AppoinmentCollection= client.db("Appoinment").collection("service");
        const BookingCollection=client.db('Appoinment').collection('Booking')

        app.get('/service',async(req,res)=>{
            const quary={};
            const result= await AppoinmentCollection.find(quary).toArray();
            res.send(result)
        })

        app.post('/booking',async(req,res)=>{
            const quary=req.body;
            const result=await BookingCollection.insertOne(quary);
            res.send(result);
        })

    }
    finally{
        // await client.close();
    }

}

run().catch(console.dir)




app.listen(port,()=>{
    console.log('Database ok');
})