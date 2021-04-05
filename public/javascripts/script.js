var stripe = Stripe('pk_test_51HQ944IJXMBHCVEyzYQaNIkphDSlGHQ81oUicGjhtMNPrkfQIWywEOPgU3xFxPsL30Pd9ay4DMqw6aH94dYmfPZ600PWzAgg0T');
var checkoutButton = document.getElementById('checkout-button');

checkoutButton.addEventListener('click', function() {

  fetch('/create-checkout-session', {
    method: 'POST',
  })
  .then(function(response) {
    return response.json();
  })
  .then(function(session) {
    return stripe.redirectToCheckout({ sessionId: session.id });
  })
  .then(function(result) {
  
    if (result.error) {
      alert(result.error.message);
    }
  })
  .catch(function(error) {
    console.error('Error:', error);
  });
});