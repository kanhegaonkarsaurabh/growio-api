import { Router } from 'express';
import { parse } from 'querystring';
//import { request } from 'https';
var request = require('request');

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


// POST request middleware parser
const parser = multer({storage: storage});


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

let retry = (function() {
    let count = 0;
  
    return function(apiPlantId, max, timeout, next) {
        request({
            method: 'POST',
            url: 'https://plant.id/api/check_identifications',
            headers: { 'Content-Type': 'application/json' },
            body: {
                key: process.env.PLANTID_APIKEY,
                ids: [parseInt(apiPlantId)]
            },
            json: true
        }, function (err, res, body) {
            if (err || res.statusCode !== 200) {
                console.log('Failed request');
                return next(new Error('API request failed'));
            }
            if (res || res.length <= 0 || res.body.suggestions.length <= 0) {
                console.log('no suggestions sent!' + count);
        
                if (count++ < max) {
                  return setTimeout(function() {
                    retry(apiPlantId, max, timeout, next);
                  }, timeout);
                } else {
                  return next(new Error('max retries reached'));
                }
              }
              console.log('success');
              next(null, body);
        })
      
    }
  })();
  


// const checkPlantId = async (apiPlantId) => {
//     console.log('this id'+apiPlantId);
    
//     while (true) {
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
//                 console.log(err)
//             }
//             console.log('Status:', res.statusCode);
//             console.log('Headers:', JSON.stringify(res.headers));
//             console.log('Response:', body);
//         })
//     }
    
// }

const plantId = async (encImage) => {

    await request({
        method: 'POST',
        url: 'https://plant.id/api/identify',
        headers: { 'Content-Type': 'application/json' },
        body: {
            key: process.env.PLANTID_APIKEY,
            images: [encImage]
        },
        json: true
    }, (err, res, body) => { 
        if (err) {
            console.log(err)
        }
        // console.log('Status:', res.statusCode);
        // console.log('Headers:', JSON.stringify(res.headers));
        // console.log('Response:', body);

        // extract the plant ID
        const apiPlantId = (res.body.id);
        retry(apiPlantId, 200, 1000, function(err, body) {
            console.log('Successful suggestions bitch!', body);
        });
    })
}

const identifyPlant = async (req, res) => {
    // extract the base64 encoded image 
    const image = req.body.image;
   // console.log(req.body);
    // send to the Plant.ID API
    plantId(image);
}

router.route('/identify')
      .post(identifyPlant)

export default router;


