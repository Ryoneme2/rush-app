const multer = require('multer');
const multerS3 = require('multer-s3');

const { S3Client } = require('@aws-sdk/client-s3')

const aws = require('aws-sdk');
aws.config.update({
  accessKeyId: process.env.CLOUD_ACCESS_KEY,
  secretAccessKey: process.env.CLOUD_SECRET_KEY,
  region: process.env.CLOUD_REGION,
})
const s3 = new aws.S3();

// Returns a Multer instance that provides several methods for generating
// middleware that process files uploaded in multipart/form-data format.
export const upload = multer({
  storage: multerS3({
    s3: s3,
    acl: 'public-read',
    bucket: process.env.CLOUD_S3_BUCKET,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: 'Meta_Data' });
    },
    key: function (req, file, cb) {

      cb(null, Date.now() + "-" + file.originalname);
    },
    filename: function (req, file, cb) {

      cb(null, Date.now() + "-" + file.originalname);
    },
    //  limits: {
    //     fileSize: 1024 * 1024 * 5 //  allowed only 5 MB files
    // }
  })
});

// export const upload = multer({
//   storage: multer.diskStorage({
//     destination: "./public/uploads",
//     filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
//   }),
// });