var express = require('express');
var router = express.Router();
const stripe = require('stripe')('sk_test_51HQ944IJXMBHCVEyjJU7JTQIvqbBgc5ccwipcRKDFryIaA0tiKzdSnd3IIszFuptC63kZZmYbNrfqt483j557JKr00Qrwk151q');

var dataBike = [
{name:"RockRider 340", url:"/images/bike-1.jpg", price:339, mea:false},
{name:"RockRider 440", url:"/images/bike-2.jpg", price:439, mea:false},
{name:"RockRider 540", url:"/images/bike-3.jpg", price:539, mea:false},
{name:"RockRider 590", url:"/images/bike-4.jpg", price:589, mea:false},
{name:"RockRider 690", url:"/images/bike-5.jpg", price:689, mea:false},
{name:"RockRider 790", url:"/images/bike-6.jpg", price:789, mea:false},
{name:"RockRider R1", url:"/images/R1.jpg", price:999, mea:true},
{name:"RockRider R2", url:"/images/R2.jpg", price:1299, mea:true},
{name:"RockRider R3", url:"/images/R3.jpg", price:1499, mea:true} ];


/* Function that creates a session on Stripe */
var sendToStripe = async (dataBikeShop,montantFraisPort) => {

  var panier = [];

  for(var i = 0; i < dataBikeShop.length; i++) {
    panier.push(
          {price_data: {
             currency: 'eur',
             product_data: {name: dataBikeShop[i].name},
             unit_amount: Number(dataBikeShop[i].price * 100)},
           quantity: dataBikeShop[i].quantity}
    );};

  if(montantFraisPort>0){
    panier.push(
          {price_data: {
             currency: 'eur',
             product_data: {name: 'Frais de port'},
             unit_amount: Number(montantFraisPort * 100)},
           quantity: 1}
    );};

  var sessionStripeID;

  if(panier.length>0){
  var session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: panier,
    mode: 'payment',
    success_url: 'http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: 'http://localhost:3000/',
  });
  sessionStripeID = session.id}

  return sessionStripeID
}

/* Function that calculates the order amount + shipping costs */
var calculTotalCommande = (dataBikeShop) => {
  var nbProduits = 0
  var totalCmd = 0

for(var i = 0; i < dataBikeShop.length; i++){
  nbProduits += dataBikeShop[i].quantity
  totalCmd += dataBikeShop[i].quantity * dataBikeShop[i].price}

  var montantFraisPort = nbProduits * 30

if(totalCmd>4000){montantFraisPort = 0
} else if(totalCmd>2000){montantFraisPort = montantFraisPort / 2}

totalCmd += montantFraisPort

return {montantFraisPort,totalCmd}
}

/* Function that selects the 3 items to focus on */

var getMeaList = (dataBike) => {
  dataBike.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
  dataBike = dataBike.filter(a => a.mea === true);
  dataBike = dataBike.slice(0,3)
  console.log(dataBike)
  return dataBike
}

/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.session.dataBikeShop == undefined) {
    req.session.dataBikeShop = [] }

    var mea = getMeaList(dataBike)

  res.render('index', { dataBike, mea });
});


/* GET shopping cart page. */
router.get('/shop', async function(req, res, next) {

  var total = calculTotalCommande(req.session.dataBikeShop)
  var montantFraisPort = total.montantFraisPort
  var montantCommande = total.totalCmd
  var sessionStripeID = await sendToStripe(req.session.dataBikeShop,montantFraisPort)

  res.render('shop', { dataBikeShop:req.session.dataBikeShop, montantFraisPort, montantCommande, sessionStripeID });
});


/* GET shopping cart page after adding 1 item or more */
router.get('/add-shop', async function(req, res, next) {

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
res.redirect('/shop')
});


/* GET delete item */
router.get('/delete-item', async function(req, res, next) {
req.session.dataBikeShop.splice(req.query.position,1)
  res.redirect('/shop');
});


/* POST update quantity manually on shopping cart page */ 
router.post('/update-quantity', async function(req, res, next) {
var position = req.body.position;
var newQuantity = req.body.quantity;
req.session.dataBikeShop[position].quantity = newQuantity;
    res.redirect('/shop');
  });


/* GET successful Payment page. */
router.get('/success', function(req, res, next) {
  res.render('success');
});


module.exports = router;
