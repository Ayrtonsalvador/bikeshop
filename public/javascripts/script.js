var stripe = Stripe('pk_test_51HQ944IJXMBHCVEyzYQaNIkphDSlGHQ81oUicGjhtMNPrkfQIWywEOPgU3xFxPsL30Pd9ay4DMqw6aH94dYmfPZ600PWzAgg0T');

document.getElementById('checkout').addEventListener("click", function(){
  stripe.redirectToCheckout({
      sessionId: sessionStripeID
    }).then(function (result) {

    });

})