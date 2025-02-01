var express = require("express")
const { graphqlHTTP } = require("express-graphql");
const mongoose = require("mongoose");
const schema = require("./graphql/Schema");
const resolvers = require("./graphql/Resolvers");
const { auth } = require("./auth");
const file = require("./file");
const cors = require('cors')

mongoose.connect(process.env.MONGODBURL, {
});
mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
});

var app = express()
let corsOptions = {
  origin : ['http://localhost:5173','http://192.168.1.22:3000'],
}

app.use(cors(corsOptions))
app.use(auth)

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" })
})

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