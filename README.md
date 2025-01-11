This is a small GraphQL project (**Backend/Frontend**), creating a demo social media app oriented on Twitter. The main reason for building that is practice GraphQL/Vue.JS.

The GraphQL part does all the essential parts of the social media app like handling login/data fetching/modifying, the `/file` API handles the file upload process.

Create a `.env` file for the config with something like this:

```
JWT_SECRET=test
STRING_LENGTH=100
BUCKET_SERVER=localhost
BUCKET_SERVER_PORT=9000
BUCKET_NAME=profile-pictures
BUCKET_URL=http://localhost:9000/
accessKey=minioadmin
secretKey=minioadmin
```

## Start the server
You need a running instance of [MinIO](https://github.com/minio/minio) and a running MongoDB server. You can set the individual URLs in the `.env` file.