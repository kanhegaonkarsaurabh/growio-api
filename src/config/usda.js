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
      //  MAIN
      //      sci name: sciName
      //      water frequency: Moisture_Use (conver to number)
      //      common name: Common_Name
      //      sunlight: Shade_Tolerance
      //      temperature: Temperature_Minimum_F (only have min)

      //  Additional:
      //      fertilizer: Fertility_Requirement
      //      pruning:
      //      humidity:

      // get the data we need in JSON format
      var obj = JSON.parse(body);
      var data = obj.data[0];

      // extract all the info we need from the JSON list
      var waterFreq = data.Moisture_Use;
      var commonName = data.Common_Name;
      var sunLight = data.Shade_Tolerance;
      var tempMin = data.Temperature_Minimum_F;
      var fertilizer = data.Fertility_Requirement;

      // JSON object with the information we need
      var thing = {
        sciName: sciName,
        waterFreq: waterFreq,
        commonName: commonName,
        sunlight: sunLight,
        temp: tempMin,
        fertilizer: fertilizer,
      };

      console.log(thing);

      callback(thing);
      //return thing;
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
