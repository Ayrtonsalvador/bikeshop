var express = require('express');
var router = express.Router();
const stripe = require('stripe')('sk_test_51HQ944IJXMBHCVEyjJU7JTQIvqbBgc5ccwipcRKDFryIaA0tiKzdSnd3IIszFuptC63kZZmYbNrfqt483j557JKr00Qrwk151q');

var dataBike = [
{name:"RockRider 340", url:"/images/bike-1.jpg", price:339},
{name:"RockRider 440", url:"/images/bike-2.jpg", price:439},
{name:"RockRider 540", url:"/images/bike-3.jpg", price:539},
{name:"RockRider 590", url:"/images/bike-4.jpg", price:589},
{name:"RockRider 690", url:"/images/bike-5.jpg", price:689},
{name:"RockRider 790", url:"/images/bike-6.jpg", price:789}];

/* GET home page. */
router.get('/', function(req, res, next) {

  if(req.session.dataBikeShop == undefined) {
    req.session.dataBikeShop = [] }

  res.render('index', { dataBike });
});


/* GET shopping cart page. */
router.get('/shop', function(req, res, next) {

var alreadyExist = false;

for(var i = 0; i < req.session.dataBikeShop.length; i++){
  if(req.session.dataBikeShop[i].name == req.query.name){
    req.session.dataBikeShop[i].quantity = Number(req.session.dataBikeShop[i].quantity) + 1;
    alreadyExist = true;} }

if(alreadyExist == false) {
  req.session.dataBikeShop.push({
    name: req.query.name,
    url: req.query.url,
    price: req.query.price,
    quantity: 1 }) }

  res.render('shop', { dataBikeShop:req.session.dataBikeShop });
});


/* GET delete item */
router.get('/delete-item', function(req, res, next) {
req.session.dataBikeShop.splice(req.query.position,1)
  res.render('shop', { dataBikeShop:req.session.dataBikeShop });
});


/* POST update quantity manually on shopping cart page */ 
router.post('/update-quantity', function(req, res, next) {
var position = req.body.position;
var newQuantity = req.body.quantity;
req.session.dataBikeShop[position].quantity = newQuantity;
    res.render('shop', { dataBikeShop:req.session.dataBikeShop });
  });




/* BACK-END Stripe API config */
router.post('/create-checkout-session', async (req, res) => {
    
    var panier = [];

    for(var i = 0; i < req.session.dataBikeShop.length; i++) {
      panier.push(
        {price_data: {
            currency: 'eur',
            product_data: {name: req.session.dataBikeShop[i].name},
            unit_amount: Number(req.session.dataBikeShop[i].price * 100)},
        quantity: req.session.dataBikeShop[i].quantity}
      );};

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: panier,
      mode: 'payment',
      success_url: 'http://localhost:3000/success',
      cancel_url: 'http://localhost:3000/',
    });
  
    res.json({ id: session.id });
});


/* GET Successful Payment page. */
router.get('/success', function(req, res, next) {
  res.render('success');
});

module.exports = router;
