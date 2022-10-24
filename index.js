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


        // সব ডাটা কে গেট করার জন্ন্য এই কোড লিখতে হয় ।
        app.get('/service',async(req,res)=>{
            const quary={};
            const result= await AppoinmentCollection.find(quary).toArray();
            res.send(result)
        })


        app.get('/available',async(req,res)=>{
            // আমার আপ্পয়েন্ট কালেশন এর মদ্ধে ডাটা গুলো কে গেট করলাম 
            const services=await AppoinmentCollection.find().toArray();

            // আমার বুকিং কালেকশন এর মধ্যে এই ডেট অনুযায়ী কয়টা বুকিং দেয়া হয়েছে তা চেক করলাম 
            const date=req.query.date;
            const quary={date:date}
            const bookings=await BookingCollection.find(quary).toArray();


            //আমার সব service ডাটা মধ্যে যত গুলো স্লট আছে আমি যখন বুকিং দেব তখন আমার service ডাটা থেকে একটি স্লট কমে গিয়ে বুকিং কালেকশন গিয়ে এড হবে ।  
            services.forEach(service=>{
                const serviceBooking=bookings.filter(book=>book.DantalName===service.name);
                const booked=serviceBooking.map(service=>service.slot);
                const available=service.slots.filter(slot=>!booked.includes(slot));
                service.slots=available;
            })

            res.send(services)
        })


        // যদি কোনো ডাটাকে পোস্ট করার পর আবার ক্লিক করলে একই ডাটা যায় তাহলে এটি বন্ধ করার জন্ন্য এইটুকু কোড লিখতে হয় । 
        app.post('/booking',async(req,res)=>{
            const booking=req.body;
            const quary={DantalName:booking.DantalName,date:booking.date,name:booking.name};
            const exists=await BookingCollection.findOne(quary);
            if(exists){
                return res.send({success:false,booking:exists})
            }
            const result=await BookingCollection.insertOne(booking);
            res.send({success:true,result});
        })



        app.get('/booking',async(req,res)=>{
            const email=req.query.email;
            const quary={email:email};
            const result=await BookingCollection.find(quary).toArray();
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