const queryPlantDetails = () => {
  // Darya, Priyal, Grace fill codeeeeee
  var request = require('request');
  return request('https://plantsdb.xyz/search?Genus=Abutilon&Species=abutiloides', function(
    error,
    response,
    body,
  ) {
    console.log('error:', error); // Print the error if one occurred
    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    console.log('body:', body); // Print the HTML for the Google homepage.
    return body;
  });
};

export { queryPlantDetails };
