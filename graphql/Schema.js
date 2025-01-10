const { buildSchema } = require("graphql");

const schema = buildSchema(`
  type User {
    firstName: String
    lastName: String
    email: String
    role: String
    dateOfBirth: String
    username: String
    profilePicture: String
    bio: String
    error: String
  }
  type PublicUser {
    username: String,
    error: String
    profilePicture: String
    bio: String
    role: String
  }
  type Followers {
    username: String,
    error: String
    profilePicture: String
    bio: String
    role: String
    isFollowing: Boolean
  }
  
  type Query {
    getUser: User
    getUsers: [PublicUser]
    getFollowRequests: [PublicUser]
    getFollowerCount: Int
    getFollowers: [Followers]
    getPosts(username: String!): [Post]
    getPost(postId: String!): FullPost
  }

  type Post {
    content: String
    users: [PublicUser]
    likes: [PublicUser]
    date: String
    postId: String
    mediaContent: [String]
  }
  
  type FullPost {
    content: String
    users: [PublicUser]
    likes: [PublicUser]
    date: String
    postId: String
    linked_posts: [Post]
    error: String
    mediaContent: [String]
  }

  type CreateUserResponse {
    token: String
    error: String
  }
  type UpdateUserResponse {
    success: Boolean
    error: String
  }

  type LoginResponse {
    token: String
    error: String
  }
  type PostResponse {
    postId: String
    error: String
  }

  type Mutation {
    createUser(username: String!, firstName: String!,lastName: String!,bio: String!,dateOfBirth: String!, email: String!, password: String!): CreateUserResponse
    updateUser(username: String, email: String, password: String,lastPassword: String,lastName: String): UpdateUserResponse
    login(username: String, email: String, password: String!): LoginResponse
    deleteUser: UpdateUserResponse
    requestFollow(username: String!): UpdateUserResponse
    acceptFollow(username: String!): UpdateUserResponse
    createPost(content: String!,referredTo: String,isActivated: Boolean): PostResponse
    likePost(postId: String!): UpdateUserResponse
    deletePost(postId: String!): UpdateUserResponse
    activatePost(postId: String!): UpdateUserResponse
  }
`);

module.exports = schema;
