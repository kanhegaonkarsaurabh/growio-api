import { Router } from 'express';
import { parse } from 'querystring';
//import { request } from 'https';
import reqPromise from 'request-promise';

const multer = require("multer");
const cloudinary = require("cloudinary");
const cloudinaryStorage = require("multer-storage-cloudinary");

const router = Router();

// cloudinary API configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUDNAME,
    api_key: process.env.CLOUDINARY_APIKEY,
    api_secret: process.env.CLOUDINARY_APISECRET
});

// creating the cloudinary storage object with settings
const storage = cloudinaryStorage({
    cloudinary: cloudinary,
    folder: "plants_identify",
    allowedFormats: ["jpg", "png"],
    transformation: [{ width: 500, height: 500, crop:"limit" }]
});

// Sleeps the execution of the function
const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

// POST request middleware parser
const parser = multer({storage: storage});


const identifyOptions = (encImage) => {
    return {
        method: 'POST',
        url: 'https://plant.id/api/identify',
        headers: { 'Content-Type': 'application/json' },
        body: {
            key: process.env.PLANTID_APIKEY,
            images: [encImage]
        },
        json: true
    }
};

const getSuggestionsOptions = (requestId) => {
    return {
        method: 'POST',
        url: 'https://plant.id/api/check_identifications',
        headers: { 'Content-Type': 'application/json' },
        body: {
            key: process.env.PLANTID_APIKEY,
            ids: [parseInt(requestId)]
        },
        json: true
    };
}

// route to identify the plant
// router.post('/identify', parser.single("image"), (req, res) => {
//     console.log(req.file);
//     const image = {}
//     image.url = req.file.url;
//     image.id = req.file.public_id;
//     console.log(image);

//     request({
//         method: 'POST',
//         url: 'https://private-anon-9aba0bab48-plantid.apiary-mock.com/identify',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: {
//             key: process.env.PLANTID_APIKEY,
//             images: [
                
//             ]
//         }
//     })
// });

// let retry = (function() {
//     let count = 0;
  
//     return function(apiPlantId, max, timeout, next) {
//         request({
//             method: 'POST',
//             url: 'https://plant.id/api/check_identifications',
//             headers: { 'Content-Type': 'application/json' },
//             body: {
//                 key: process.env.PLANTID_APIKEY,
//                 ids: [parseInt(apiPlantId)]
//             },
//             json: true
//         }, function (err, res, body) {
//             if (err || res.statusCode !== 200) {
//                 console.log('Failed request');
//                 return next(new Error('API request failed'));
//             }
//             if (res || res.length <= 0 || res.body.suggestions.length <= 0) {
//                 console.log('no suggestions sent!' + count);
        
//                 if (count++ < max) {
//                   return setTimeout(function() {
//                     retry(apiPlantId, max, timeout, next);
//                   }, timeout);
//                 } else {
//                   return next(new Error('max retries reached'));
//                 }
//               }
//               console.log('success');
//               next(null, body);
//         })
      
//     }
//   })();
  


// const checkPlantId = async (apiPlantId) => {
//     console.log('Currently working on request: ', apiPlantId);
//     let suggestionsList = null;
//     await sleep(5000);
//     while (!suggestionsList) {
//         console.log('this is working :)');
//         await sleep(5000);              // IMPORTANT LINE
//         const resp = await request({
//             method: 'POST',
//             url: 'https://plant.id/api/check_identifications',
//             headers: { 'Content-Type': 'application/json' },
//             body: {
//                 key: process.env.PLANTID_APIKEY,
//                 ids: [parseInt(apiPlantId)]
//             },
//             json: true
//         }, (err, res, body) => {
//             if (err) {
//                 console.log('ERROR: checkPlantId() function request failed', err);
//             }
//             if (res.body.suggestions) {
//                 if (res.body.suggestions.length > 0) {
//                     suggestionsList = res.body.suggestions;
//                     console.log('this', suggestionsList);
//                     return;
//                 }
//             }
//         });
//     console.log('loop is running');
//     }
    
// }

// const plantId = async (encImage) => {
//     await request({
//         method: 'POST',
//         url: 'https://plant.id/api/identify',
//         headers: { 'Content-Type': 'application/json' },
//         body: {
//             key: process.env.PLANTID_APIKEY,
//             images: [encImage]
//         },
//         json: true
//     }, (err, res, body) => { 
//         if (err) {
//             console.log('ERROR: platnId() request failed', err);
//             return;
//         }

//         // extract the plant ID
//         if (body && body.id) {
//             const apiPlantId = (body.id);
//             console.log('api id: ', apiPlantId);
//             checkPlantId(apiPlantId);
//         }
//     })
// }

const suggestionsHelper = (plantRequestId, count, callback) => {
    reqPromise(getSuggestionsOptions(plantRequestId))
    .then(body => {
        console.log('Try ' + count, body);
        if (body.length > 0 ) {        
            if (body[0].suggestions.length > 0) { // atleast one suggestions is made
                callback(body);
                return;
            }
        }
        suggestionsHelper(plantRequestId, count += 1, callback);
    })
    .catch('ERROR: getSuggestions request failed');
}

const identifyPlant = async (req, res) => {
    // extract the base64 encoded image 
    const image = req.body.image;

    // promise pattern requests
    reqPromise(identifyOptions(image))
        .then(async (body) => {
            const plantRequestId = body.id;
            console.log('IN_PROGRESS identify')
            let count = 0
            await sleep(5000);
            suggestionsHelper(plantRequestId, count, function (body) {        // callback function here ends everything
                console.log('SUCCESS: The suggestions are the following', body);
                res.send({suggestions:body[0].suggestions});
            });
        })
        .catch((err) => {
            console.log('ERROR: plant identify request failed', err);
        });
}

router.route('/identify')
      .post(identifyPlant)

export default router;


