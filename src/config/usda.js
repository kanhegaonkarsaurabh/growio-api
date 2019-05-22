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
      // get the data we need in JSON format
      console.log('\n\n\n\n' + body);
      var obj = JSON.parse(body);
      var data = obj.data[0];

      // extract all the info we need from the JSON list
      var moistureUse = data.Moisture_Use;
      var commonName = data.Common_Name;
      var sunLight = data.Shade_Tolerance;
      var tempMin = data.Temperature_Minimum_F;
      var fertilizer = data.Fertility_Requirement;

      // JSON object with the information we need
      var JSONobj = {
        scientificName: sciName,
        commonName: commonName,
        moisture_use: moistureUse,
        sunlight: sunLight,
        temperature: tempMin,
      };

      // console.log(thing);

      callback(JSONobj);
    },
  );
};

export { queryPlantDetails };
