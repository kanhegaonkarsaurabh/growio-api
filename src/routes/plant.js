import { Router } from 'express';
import { parse } from 'querystring';
//import { request } from 'https';
import reqPromise from 'request-promise';

const cloudinary = require('cloudinary').v2;

const router = Router();

// cloudinary API configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUDNAME,
  api_key: process.env.CLOUDINARY_APIKEY,
  api_secret: process.env.CLOUDINARY_APISECRET,
});

// Sleeps the execution of the function
const sleep = milliseconds => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};

export const uploadToCloudinary = imageUrl => {
  cloudinary.uploader.upload(
    imageUrl,
    { folder: 'plants_identify', width: 500, height: 500, crop: 'limit' },
    function(err, image) {
      if (err) {
        console.log(err);
      }
      return image.url;
    },
  );
};

const identifyOptions = encImage => {
  return {
    method: 'POST',
    url: 'https://plant.id/api/identify',
    headers: { 'Content-Type': 'application/json' },
    body: {
      key: process.env.PLANTID_APIKEY,
      images: [encImage],
    },
    json: true,
  };
};

const getSuggestionsOptions = requestId => {
  return {
    method: 'POST',
    url: 'https://plant.id/api/check_identifications',
    headers: { 'Content-Type': 'application/json' },
    body: {
      key: process.env.PLANTID_APIKEY,
      ids: [parseInt(requestId)],
    },
    json: true,
  };
};

const suggestionsHelper = (plantRequestId, count, callback) => {
  reqPromise(getSuggestionsOptions(plantRequestId))
    .then(body => {
      console.log('Try ' + count, body);
      if (body.length > 0) {
        if (body[0].suggestions.length > 0) {
          // atleast one suggestions is made
          callback(body);
          return;
        }
      }
      suggestionsHelper(plantRequestId, (count += 1), callback);
    })
    .catch('ERROR: getSuggestions request failed');
};

const identifyPlant = async (req, res) => {
  // extract the base64 encoded image
  const image = req.body.image;

  // promise pattern requests
  reqPromise(identifyOptions(image))
    .then(async body => {
      const plantRequestId = body.id;
      console.log('IN_PROGRESS identify');
      let count = 0;
      await sleep(5000);
      suggestionsHelper(plantRequestId, count, function(body) {
        // callback function here ends everything
        console.log('SUCCESS: The suggestions are the following', body);

        // extract the images list
        //const image = body[0].images[0];
        res.send({ body });
      });
    })
    .catch(err => {
      console.log('ERROR: plant identify request failed', err);
    });
};

router.route('/identify').post(identifyPlant);

module.exports = router;
