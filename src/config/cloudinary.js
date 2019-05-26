const cloudinary = require('cloudinary').v2;

// cloudinary API configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUDNAME,
  api_key: process.env.CLOUDINARY_APIKEY,
  api_secret: process.env.CLOUDINARY_APISECRET,
});

export const uploadToCloudinary = plantUrl => {
  cloudinary.uploader.upload(
    plantUrl,
    { folder: 'plants_identify', width: 500, height: 500, crop: 'limit' },
    function(err, image) {
      if (err) {
        console.log(err);
        return null;
      }
      return image.url;
    },
  );
};

export const removeFromCloudinary = plantUrl => {
  const id = plantUrl.split('/')[6].split('.')[0];

  cloudinary.uploader.destroy(id, (err, res) => {
    if (err) {
      console.log(err);
    }
    return res.result;
  });
};