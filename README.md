This is a small GraphQL project (**Backend**), creating a demo social media app oriented on Twitter. The main reason for building that is practice GraphQL.

The GraphQL part does all the essential parts of the social media app like handling login/data fetching/modifying, the `/file` API handles the file upload process.

Create a `.env` file for the config with something like this:

```
JWT_SECRET=test
STRING_LENGTH=100
BUCKET_NAME=profile-pictures
BUCKET_URL=http://localhost:9000/
```