var express = require("express")
const { graphqlHTTP } = require("express-graphql");
const mongoose = require("mongoose");
const schema = require("./graphql/Schema");
const resolvers = require("./graphql/Resolvers");
const { auth } = require("./auth");
const file = require("./file");

mongoose.connect("mongodb://localhost:27017/purple", {
});
mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
});

var app = express()

app.use(auth)

app.use("/file", file)

app.use(
  "/graphql",
  graphqlHTTP((request, response, graphQLParams) => ({
    schema: schema,
    rootValue: resolvers,
    context: {
      auth: request.auth
    }
  }))
)

app.listen(4000)
console.log("Server started!")