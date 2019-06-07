import request from 'request';
import mongoose from 'mongoose';

const Plant = mongoose.model('Plant');

function externalUsdaRequest(url, qs) {
  return new Promise((resolve, reject) => {
    request({ url: url, qs: qs }, function (err, response, body) {
      // default values TODO change if necessary there are temp
      const _DEFAULT_MOISTURE = 'Medium';
      const _DEFAULT_SUN = 'Partial';
      const _DEFAULT_TEMP = '40';

      // get the data we need in JSON format
      var obj = JSON.parse(body);
      let data;
      if (obj.data) {
        data = obj.data[0];
      } else {  // Reject and end execution of the promise if no plants are found
        console.log('ERROR: Fetching through usda: ', err, response, body);
        reject(new Error('NOT FOUND: Could not find any plants that match the search query in Plantcyclopedia'));
        return;
      }

      // extract all the info we need from the JSON list
      var moistureUse = data.Moisture_Use;
      var commonName = data.Common_Name;
      var sunLight = data.Shade_Tolerance;
      var tempMin = data.Temperature_Minimum_F;
      var sciName = data.Scientific_Name_x;
      var symbol = data.Symbol;

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
        symbol: symbol
      };

      // console.log(thing);

      resolve(JSONobj);
    });
  });
}



const queryPlantDetails = async (searchQuery, searchBy) => {
  /*
  scientificName: sciName,
        commonName: commonName,
        moisture_use: moistureUse,
        sunlight: sunLight,
        temperature: tempMin,*/

  // getting the genus and species based on the scientific name
  const plantDBurl = 'https://plantsdb.xyz/search?';
  let queryObject;
  if (searchBy === 'sciName') {
    let arr = searchQuery.split(' ');
    let genus = arr[0];
    let species = arr[1];

    let re = new RegExp("^([a-zA-Z])\.");
    if (re.test(species)) {
      queryObject = {
        Genus: genus,
        limit: 3,
      }
    } else {
      queryObject = {
        Genus: genus,
        Species: species,
        limit: 3,
      };
    }
  } else if (searchBy === 'commonName') {
    queryObject = {
      Common_Name: searchQuery,
      limit: 1
    }
  }

  console.log('Queries received at the frontend: ', queryObject);
  return await externalUsdaRequest(plantDBurl, queryObject);
};

export { queryPlantDetails };
