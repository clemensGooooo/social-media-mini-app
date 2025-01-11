const express = require("express");
const multer = require('multer');
const Minio = require('minio');
const path = require('path');

const User = require("./models/User");
const Posts = require("./models/Posts");


const file = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB
        files: 1
    },
    fileFilter: function (_req, file, cb) {
        try {
            checkFileType(file, cb);
        } catch {
            return cb(null, false);
        }
    }
});

// https://stackoverflow.com/questions/60408575/how-to-validate-file-extension-with-multer-middleware
const checkFileType = (file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        return cb(null, false);
    }
}

const minioClient = new Minio.Client({
    endPoint: process.env.BUCKET_SERVER,
    port: process.env.BUCKET_SERVER_PORT,
    useSSL: false,
    accessKey: process.env.accessKey,
    secretKey: process.env.secretKey,
});

// Ensure the buckets exist
const bucketNames = [process.env.BUCKET_NAME, 'posts'];

(async () => {
    for (const bucketName of bucketNames) {
        const bucketExists = await minioClient.bucketExists(bucketName).catch(() => false);
        if (!bucketExists) {
            await minioClient.makeBucket('profile-pictures', 'here');
            console.log(`Bucket "${bucketName}" created successfully.`);
        }
        const policy = {
            Version: "2012-10-17",
            Statement: [
                {
                    Effect: "Allow",
                    Principal: "*",
                    Action: ["s3:GetObject"],
                    Resource: [`arn:aws:s3:::${bucketName}/*`]
                }
            ]
        };

        await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
    }
})();

file.post('/profileUpload', upload.single('file'), async (req, res) => {
    if (req.auth.user !== "user") {
        return res.status(400).send({ error: "You are not authorized to perform this action" });
    }
    const id = req.auth.id;
    try {
        const { file } = req;
        if (!file) {
            return res.status(400).send({ error: 'No file uploaded' });
        }

        const { originalname, mimetype } = file;
        const uniqueFilename = `${Date.now()}-${originalname}`;

        await minioClient.putObject(bucketNames[0], uniqueFilename, file.buffer, {
            'Content-Type': mimetype
        });

        const url = `${process.env.BUCKET_URL}/${bucketNames[0]}/${uniqueFilename}`;

        const user = await User.findById(id);
        if (user.profilePicture) {
            const existingFilename = user.profilePicture.split('/').pop();
            await minioClient.removeObject(bucketNames[0], existingFilename);
        }
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { profilePicture: url },
            { new: true }
        );
        res.status(200).send({ filename: originalname, mimetype, url });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).send({ error: 'Failed to upload file' });
    }
});

file.post('/mediaUpload', upload.single('file'), async (req, res) => {
    req
    if (req.auth.user !== "user") {
        return res.status(400).send({ error: "You are not authorized to perform this action" });
    }
    try {
        const { file } = req;
        if (!file) {
            return res.status(400).send({ error: 'No file uploaded' });
        }
        if (!req.body.postId) {
            return res.status(400).send({ error: 'No postId used!' });
        }

        const id = req.body.postId;
        const post = await Posts.findOne({ postId: id });

        if (!post) {
            return res.status(404).send({ error: 'Post not found' });
        }
        if (post.isOnline) {
            return res.status(400).send({ error: 'Post is online, cannot add media!' });
        }
        const { originalname, mimetype } = file;
        const uniqueFilename = `${Date.now()}-${originalname}`;

        await minioClient.putObject(bucketNames[1], uniqueFilename, file.buffer, {
            'Content-Type': mimetype
        });

        const url = `${process.env.BUCKET_URL}${bucketNames[1]}/${uniqueFilename}`;

        if (!post.mediaContent) {
            post.mediaContent = [];
        }
        post.mediaContent.push(url);
        await post.save();

        res.status(200).send({ filename: originalname, mimetype, url });

    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).send({ error: 'Failed to upload file' });
    }
});

module.exports = file;

