const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const app = express();
app.set('view engine', 'ejs');
const mongoose=require('mongoose');
const passport=require('passport');
var session = require('express-session');
mongoose.connect("mongodb://localhost:27017/medicalDB", { useUnifiedTopology: true , useNewUrlParser: true });

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
const passportLocalMongoose = require('passport-local-mongoose');
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true
}))

require("./routes/web")(app)
app.use(passport.initialize());
app.use(passport.session());
const webSchema=new mongoose.Schema({
  name:String,
  number:Number,
  password:String
})
webSchema.plugin(passportLocalMongoose);

const Web=mongoose.model("Web",webSchema);

passport.use(Web.createStrategy());

passport.serializeUser(Web.serializeUser());
passport.deserializeUser(Web.deserializeUser());
const webCart=new mongoose.Schema({
  id:Number,
  name:String,
  price:Number
})

const t=[
  {
    "id": 1,
    "title": "Apples",
    "description": "Apples are 25 CHF each",
    "price": 25
  },
  {
    "id": 2,
    "title": "Oranges",
    "description": "Oranges are 30 CHF each",
    "price": 30
  },
  {
    "id": 3,
    "title": "Garlic",
    "description": "Garlic are 15 CHF each",
    "price": 15
  },
  {
    "id": 4,
    "title": "Papayas",
    "description": "Papayas are, but are available as 3 for the price of 2",
    "price": 100
  }
]

const Cart=mongoose.model("Cart",webCart)
app.get("/",function(req,res) {
   res.render("index")
});
app.get("/categories",function(req,res) {
  res.render("categories",{products:t})
})
var cart1=require("./models/cart")
const u=[]
price=0
quantity=0
app.get('/add/:id', function(req, res, next) {

  var productId = req.params.id;
  u.push(t[productId-1])
  var cart = new cart1(req.session.cart ? req.session.cart : {});
  var product = t.filter(function(item) {
    return item.id == productId;
  });
  cart.add(product[0], productId);
  req.session.cart = cart;

  res.redirect('/categories');

});

app.get('/cart',function(req,res) {
  // res.render("cart",{product:u})

  if (!req.session.cart) {
    return res.render('cart', {
      products: null
    });
  }
  var cart = new cart1(req.session.cart);
  res.render('cart', {

    products: cart.getItems(),
    totalPrice: cart.totalPrice
  });


})
app.get('/remove/:id', function(req, res, next) {
  var productId = req.params.id;
  var cart = new cart1(req.session.cart ? req.session.cart : {});
  cart.remove(productId);
  req.session.cart = cart;
  res.redirect('/cart');
});
app.get("/submit",function(req,res) {
  if(req.isAuthenticated()){
    console.log("unna");
  }
  else{
    res.redirect("/login")
  }
})

app.post("/signup",function(req,res) {
  const name=req.body.name
  const number=req.body.number
  const password=req.body.password
  const s=new Web({
    name:name,
    number:number,
    password:password
  })
  s.save(function(err,user) {
    if(err){
      console.log(err);
    }
    else{
      console.log("success");
    }
  })

})
app.post("/login",function(req,res) {
 const name=req.body.name
 const password=req.body.password
 Web.findOne({name:name},function(err,foundUser) {
   if(err)
   {
     console.log(err);
   }
   else{
     if(foundUser.password===password){
       res.render("index")
     }
     else{
       res.render("signup")
     }
   }
 })
})

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
