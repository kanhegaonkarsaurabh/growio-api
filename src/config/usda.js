const queryPlantDetails = (sciName, callback) => {
  // Darya, Priyal, Grace fill codeeeeee
  var request = require('request');

  // getting the genus and species based on the scientific name
  var arr = sciName.split(' ');
  var genus = arr[0];
  var species = arr[1];

  var plantDBurl = 'https://plantsdb.xyz/search?';
  var queryObject = {
    Genus: genus,
    Species: species,
    limit: 1,
  };

  request(
    {
      url: plantDBurl,
      qs: queryObject,
    },
    async function(error, response, body) {
      callback(body);
    },
  );
};

export { queryPlantDetails };

// // Load OpenWeather Credentials
// var OpenWeatherAppId = require('../config/third-party').openWeather;

// router.post('/getCurrentWeather', function (req, res) {
//     var urlOpenWeatherCurrent = 'http://api.openweathermap.org/data/2.5/weather?'
//     var queryObject = {
//         APPID: OpenWeatherAppId.appId,
//         lat: req.body.lat,
//         lon: req.body.lon
//     }
//     console.log(queryObject)
//     request({
//         url:urlOpenWeatherCurrent,
//         qs: queryObject
//     }, function (error, response, body) {
//         if (error) {
//             console.log('error:', error); // Print the error if one occurred

//         } else if(response && body) {
//             console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
//             res.json({'body': body}); // Print JSON response.
//         }
//     })
// })
