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
    followerRequest: Int
  }
  type PublicUser {
    username: String
    error: String
    profilePicture: String
    bio: String
    role: String
    followed: Int
  }
  type Followers {
    username: String,
    error: String
    profilePicture: String
    bio: String
    role: String
    isFollowing: Boolean
  }
  type PostMultiple {
    error: String
    posts: [Post]
  }
  type Report {
    type: String
    description: String
    post: Post
    date: String
    status: Int
  }
  
  type Query {
    getUser: User
    getPublicUser(username: String): PublicUser
    getUsers: [PublicUser]
    getFollowRequests: [PublicUser]
    getFollowerCount: Int
    getFollowers: [Followers]
    getPosts(username: String!): PostMultiple
    getPost(postId: String!): FullPost
    getNewestPosts: PostMultiple
    searchUsers(query: String): [PublicUser]
    getReports: [Report]
    getLikedPosts: [Post]
    getFollowed: [PublicUser]
  }

  type Post {
    content: String
    users: [PublicUser]
    likes: [PublicUser]
    date: String
    postId: String
    mediaContent: [String]
    commentCount: Int
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
  type LikeResponse {
    success: Boolean
    error: String
    isLiked: Boolean
  }

  type Mutation {
    createUser(username: String!, firstName: String!,lastName: String!,bio: String!,dateOfBirth: String!, email: String!, password: String!,isPrivate: Boolean): CreateUserResponse
    updateUser(username: String, email: String, password: String,lastPassword: String,lastName: String,bio: String): UpdateUserResponse
    login(username: String, email: String, password: String!): LoginResponse
    deleteUser: UpdateUserResponse
    requestFollow(username: String!): UpdateUserResponse
    acceptFollow(username: String!): UpdateUserResponse
    createPost(content: String!,referredTo: String,isActivated: Boolean): PostResponse
    likePost(postId: String!,remove: Boolean): LikeResponse
    deletePost(postId: String!): UpdateUserResponse
    activatePost(postId: String!): UpdateUserResponse
    unFollow(username: String!): UpdateUserResponse
    createReport(type: String!,description: String!): UpdateUserResponse
  }
`);

module.exports = schema;
