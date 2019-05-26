import request from 'request';
import mongoose from 'mongoose';

const Plant = mongoose.model('Plant');

function externalUsdaRequest(url, qs, sciName) {
  return new Promise(resolve => {
    request({ url: url, qs: qs }, function (err, response, body) {
      // default values TODO change if necessary there are temp
      const _DEFAULT_MOISTURE = 'Medium';
      const _DEFAULT_SUN = 'Partial';
      const _DEFAULT_TEMP = '40';

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

      // check if it's empty string - if so, go to default values
      if (moistureUse == '') {
        moistureUse = _DEFAULT_MOISTURE;
      }

      if (sunLight == '') {
        sunLight = _DEFAULT_SUN;
      }

      if (tempMin == '') {
        tempMin = _DEFAULT_TEMP;
      }

      // JSON object with the information we need
      var JSONobj = {
        scientificName: sciName,
        commonName: commonName,
        moisture_use: moistureUse,
        sunlight: sunLight,
        temperature: tempMin,
      };

      // console.log(thing);

      resolve(JSONobj);
    });
  });
}



const queryPlantDetails = async (sciName) => {
  /*
  scientificName: sciName,
        commonName: commonName,
        moisture_use: moistureUse,
        sunlight: sunLight,
        temperature: tempMin,*/

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

  return await externalUsdaRequest(plantDBurl, queryObject, sciName);
};

export { queryPlantDetails };
