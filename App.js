//App.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { S3Client, ListObjectsCommand, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const app = express();
const port = 3000;

const corsOptions = {
    origin: 'http://my-cool-local-bucket.s3-website-us-east-1.amazonaws.com',
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// AWS S3 configuration
const s3Client = new S3Client({ region: 'us-east-1' });

// Multer middleware configuration for handling file uploads
const upload = multer({ dest: 'uploads/' });

// Endpoint to list all objects in a bucket


// Endpoint to upload an object to a bucket
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const file = req.file;
        const uploadParams = {
            Bucket: 'my-cool-local-bucket',
            Key: file.originalname,
            Body: require('fs').createReadStream(file.path),
        };
        await s3Client.send(new PutObjectCommand(uploadParams));
        res.send("Object uploaded successfully");
    } catch (err) {
        console.error("Error uploading object:", err);
        res.status(500).send("Error uploading object");
    }
});

app.get('/getObject/:key', async (req, res) => {
    const key = req.params.key;
    try {
        const command = new GetObjectCommand({ Bucket: 'my-cool-local-bucket', Key: key });
        const data = await s3Client.send(command);
        res.send(data.Body.toString());
    } catch (err) {
        console.error("Error retrieving object:", err);
        res.status(500).send("Error retrieving object");
    }
});

app.get('/listObjects', async (req, res) => {
    try {
        const command = new ListObjectsCommand({ Bucket: 'my-cool-local-bucket' }); 
        const data = await s3Client.send(command);
        res.json(data.Contents.map(object => object.Key));
    } catch (err) {
        console.error("Error listing objects:", err);
        res.status(500).send("Error listing objects");
    }
});




// Start the Express server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
