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
router.post('/identify', parser.single("image"), (req,res) => {
    const image = {}
    image.url = req.file.url;
    image.id = req.file.public_id;
    console.log(image);
});


