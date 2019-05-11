import { Router } from 'express';

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
router.post('/identify', parser.single("image"), (req, res) => {
    console.log(req.file);
    const image = {}
    image.url = req.file.url;
    image.id = req.file.public_id;
    console.log(image);

    request({
        method: 'POST',
        url: 'https://private-anon-9aba0bab48-plantid.apiary-mock.com/identify',
        headers: {
            'Content-Type': 'application/json'
        },
        body: {
            key: process.env.PLANTID_APIKEY,
            images: [
                
            ]
        }
    })
});

export default router;


