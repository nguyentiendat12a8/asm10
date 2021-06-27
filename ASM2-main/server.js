var express = require('express')
var hbs = require('hbs')

var app= express()
app.set('view engine','hbs');
hbs.registerPartials(__dirname +'/views/partials')

var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb+srv://nguyentiendat12a8:sofm27112000@cluster0.eztba.mongodb.net/test';  

app.get('/', async (req,res)=>{
    let client= await MongoClient.connect(url);
    let dbo = client.db("ProductDB");
    let results = await dbo.collection("product").find({}).toArray();
    res.render('index',{model:results})
})
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/search',(req,res)=>{
    res.render('search')
})

app.get('/insert',(req,res)=>{
    res.render('insert')
})
app.get('/delete', async (req,res)=>{
    let id = req.query.id;
    let ObjectID = require('mongodb').ObjectID(id);
    let condition = {'_id': ObjectID}
    let client= await MongoClient.connect(url);
    let dbo = client.db("ProductDB");
    await dbo.collection("product").deleteOne(condition);
    res.redirect('/');

})
app.get('/edit', async(req,res)=>{
    let id = req.query.id;
    let ObjectID = require('mongodb').ObjectID(id)
    let condition = {'_id':ObjectID}
    let client = await MongoClient.connect(url)
    let dbo = client.db("ProductDB")
    let prod = await dbo.collection("product").findOne(condition);
    res.render('edit',{model:prod})
})
app.post('/doInsert',async (req,res)=>{
    let nameInput = req.body.txtName;
    let descriptionInput = req.body.txtDescription;
    let colorInput = req.body.txtColor;
    let priceInput = req.body.txtPrice;
    let errorMsg =  {
        name : '',
        price: ''
    }
    if(nameInput !=null && nameInput.length <5){
        errorMsg.name = "Name's length >=5";
    }
    if(priceInput !=null && eval(priceInput)< 0){
        errorMsg.price = 'Price must >=0'
    }
    if(errorMsg.name.length !=0 || errorMsg.price.length){
        res.render('insert',{error:errorMsg})
    }else{
            let newProduct = {
            productName : nameInput,
            description: descriptionInput,
            price: priceInput,
            color: colorInput
        }
        let client= await MongoClient.connect(url);
        let dbo = client.db("ProductDB");
        await dbo.collection("product").insertOne(newProduct);
        res.redirect('/')
    }
    
})

app.post('/doSearch',async (req,res)=>{
    let nameSearch = req.body.txtSearch;
    let client= await MongoClient.connect(url);
    let dbo = client.db("ProductDB");
    let results = await dbo.collection("product").
    find({productName: new RegExp(nameSearch,'i')}).toArray();
    res.render('index',{model:results})
})

app.post('/doEdit',async (req,res)=>{
    let nameInput = req.body.txtName;
    let descriptionInput = req.body.txtDescription;
    let colorInput = req.body.txtColor;
    let priceInput = req.body.txtPrice;
    let id = req.body.id;
    
    let newValues ={$set : {productName: nameInput,description : descriptionInput,price:priceInput,color:colorInput}};
    var ObjectID = require('mongodb').ObjectID;
    let condition = {"_id" : ObjectID(id)};
    
    let client= await MongoClient.connect(url);
    let dbo = client.db("ProductDB");
    await dbo.collection("product").updateOne(condition,newValues);
    res.redirect('/');
})

const PORT = process.env.PORT || 4000;
app.listen(PORT)
console.log('Server is running')