const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const app = express();
const upload = multer({ dest: 'uploads/' });

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
});

app.set('view engine', 'ejs');

app.get('/', async (req, res) => {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
  };

  try {
    const data = await s3.listObjectsV2(params).promise();
    res.render('index', { files: data.Contents });
  } catch (err) {
    res.send("Error listing files: " + err);
  }
});

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const fileContent = await fs.readFile(req.file.path);

    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: req.file.originalname,
      Body: fileContent,
    };

    const data = await s3.upload(params).promise();
    
    // Hapus file lokal setelah upload
    await fs.unlink(req.file.path);
    
    res.redirect('/');
  } catch (err) {
    res.send("Upload gagal: " + err);
  }
});

app.listen(3000, '0.0.0.0', () => {
  console.log('Server running at http://localhost:3000');
  console.log("🚀 Update baru di " + new Date());
});
