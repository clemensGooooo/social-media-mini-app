const User = require("../models/User");
const { generateJWT } = require("../auth");
const { sanitizer_names, isEmailValid, sanitizer_bio, sanitizer_markdown } = require("../controllers/sanitizer");
const { generatePassword, checkPassword } = require("../controllers/password");
const Posts = require("../models/Posts");
const crypto = require("crypto");


const resolvers = {
    getUser: async (args, context) => {
        if (context.auth.user !== "user") {
            return { error: "You are not authorized to perform this action" };
        }
        const id = context.auth.id;
        try {
            const user = await User.findById(id);
            return {
                firstName: user.firstName,
                lastName: user.lastName,
                dateOfBirth: user.dateOfBirth,
                email: user.email,
                username: user.username,
                bio: user.bio,
                role: user.role,
                profilePicture: user.profilePicture,
                followerRequest: user.requested_followers.length
            };
        } catch (err) {
            return { error: "Error retrieving user" };
        }
    },
    getUsers: async (context) => {
        try {
            const users = await User.find();
            const filteredUsers = users.map(user => {
                return {
                    username: user.username,
                    bio: user.bio,
                    role: user.role,
                    profilePicture: user.profilePicture
                };
            });
            return filteredUsers;
        } catch (err) {
            return { error: "Error retrieving users" }
        }
    },
    getPublicUser: async ({ username }) => {
        try {
            const user = await User.findOne({ username: { $eq: username } });
            return {
                username: user.username,
                bio: user.bio,
                role: user.role,
                profilePicture: user.profilePicture
            };
        } catch (err) {
            return { error: "Error retrieving user" }
        }
    },
    createUser: async ({ firstName, lastName, dateOfBirth, email, password, username, bio }, context) => {
        try {
            role = "user";
            profilePicture = "none";
            if (isEmailValid(email) === false) {
                return { error: "Invalid email" }
            }
            if (password.length < 8) {
                return { error: "Password must be at least 8 characters long" }
            }
            if (firstName.length > process.env.STRING_LENGTH ||
                lastName.length > process.env.STRING_LENGTH ||
                username.length > process.env.STRING_LENGTH ||
                bio.length > process.env.STRING_LENGTH * 5) {
                return { error: "You have exceeded the maximum length of data" }
            }
            const user_sanitized = {
                firstName: sanitizer_names(firstName),
                lastName: sanitizer_names(lastName),
                dateOfBirth,
                bio: sanitizer_bio(bio),
                role,
                email,
                password: await generatePassword(password),
                profilePicture,
                username: sanitizer_names(username)
            };

            const user = new User(user_sanitized);
            await user.save();
            const token = generateJWT(user.email, user.id);
            return { token: token };
        } catch (err) {
            if (err.code === 11000 && err.keyPattern.email) {
                return { error: "Email already exists" }
            }
            if (err.code === 11000 && err.keyPattern.username) {
                return { error: "Username already exists" }
            } else {
                return { error: "Unexpected error occurred" }

            }
        }
    },
    updateUser: async ({ firstName, lastName, username, email, password, lastPassword, bio }, context) => {
        if (context.auth.user !== "user") {
            return { error: "You are not authorized to perform this action" };
        }
        const user_sanitized = {};
        const id = context.auth.id;

        if (firstName) {
            user_sanitized.firstName = sanitizer_names(firstName);
        }
        if (lastName) {
            user_sanitized.lastName = sanitizer_names(lastName);
        }
        if (username) {
            user_sanitized.username = sanitizer_names(username);
        }
        if (bio) {
            user_sanitized.bio = sanitizer_bio(bio);
        }
        if (email) {
            if (isEmailValid(email)) {
                user_sanitized.email = email;
            } else {
                return { error: "Invalid email" }
            }
        }
        if (password) {
            if (lastPassword) {
                const user = await User.findById(id)
                const isPasswordMatch = await checkPassword(lastPassword, user.password);
                /*if (!isPasswordMatch) {
                    return { error: "Incorrect password" }
                }*/
                if (password.length >= 8) {
                    user_sanitized.password = await generatePassword(password);
                } else {
                    return { error: "Password must be at least 8 characters long" }
                }
            }
            else {
                return { error: "You must provide your last password" }
            }
        }

        try {
            const user = await User.findByIdAndUpdate(
                id,
                user_sanitized,
                { new: true }
            );
            return { success: true };
        } catch (err) {
            if (err.code === 11000 && err.keyPattern.username) {
                return { error: "Username already exists" }
            }
        }
    },
    login: async ({ email, username, password }) => {
        if (!email && !username) {
            return { error: "You must provide either an email or a username" }
        }
        try {
            const user = await User.findOne({ $or: [{ email }, { username }] });
            if (!user) {
                return { error: "User not found" }
            }
            const isPasswordMatch = await checkPassword(password, user.password);
            if (!isPasswordMatch) {
                return { error: "Incorrect password" }
            }
            const token = generateJWT(user.email, user.id);
            return { token: token };
        } catch (err) {
            return { error: "Unexpected error" }
        }
    },
    deleteUser: async (args, context) => {
        if (context.auth.user !== "user") {
            return { error: "You are not authorized to perform this action" };
        }
        const id = context.auth.id;
        try {
            const user = await User.findByIdAndDelete(id);
            return { success: true };
        } catch (err) {
            return { error: "Unexpected error" }
        }
    },
    requestFollow: async ({ username }, context) => {
        if (context.auth.user !== "user") {
            return { error: "You are not authorized to perform this action" };
        }
        const id = context.auth.id;
        try {
            const user = await User.findOne({ username });
            if (!user) {
                return { error: "User not found" }
            }
            if (user.id === id) {
                return { error: "You cannot follow yourself" }
            }
            const userRequested = await User.findByIdAndUpdate(
                user.id,
                { $addToSet: { requested_followers: id } },
                { new: true }
            );
            return { success: true };
        } catch (err) {
            return { error: "Unexpected" }
        }
    },
    getFollowRequests: async (args, context) => {
        if (context.auth.user !== "user") {
            return { error: "You are not authorized to perform this action" };
        }
        const id = context.auth.id;
        try {
            const user = await User.findById(id);
            const users = await User.find({ _id: { $in: user.requested_followers } });
            const filteredUsers = users.map(user => {
                return {
                    username: user.username,
                    bio: user.bio,
                    role: user.role,
                    profilePicture: user.profilePicture
                };
            });
            return filteredUsers;
        } catch (err) {
            return { error: "Error retrieving users" }
        }
    },
    acceptFollow: async ({ username }, context) => {
        if (context.auth.user !== "user") {
            return { error: "You are not authorized to perform this action" };
        }
        const id = context.auth.id;
        try {
            const user = await User.findOne({ username });
            if (!user) {
                return { error: "User not found" }
            }
            const userRequested = await User.findByIdAndUpdate(
                id,
                { $addToSet: { followers: user.id }, $pull: { requested_followers: user.id } },
                { new: true }
            );
            return { success: true };
        } catch (err) {
            return { error: "Unexpected" }
        }
    },
    getFollowerCount: async (args, context) => {
        if (context.auth.user !== "user") {
            return { error: "You are not authorized to perform this action" };
        }
        const id = context.auth.id;
        try {
            const user = await User.findById(id);
            return user.followers.length;
        } catch (err) {
            return { error: "Error retrieving follower count" }
        }
    },
    getFollowers: async (args, context) => {
        if (context.auth.user !== "user") {
            return { error: "You are not authorized to perform this action" };
        }
        const id = context.auth.id;
        try {
            const user = await User.findById(id);
            const users = await User.find({ _id: { $in: user.followers } });
            const filteredUsers = users.map(async (user) => {
                const follower = await User.findById(user.id);
                const following = follower.followers.includes(id);
                return {
                    username: user.username,
                    bio: user.bio,
                    role: user.role,
                    profilePicture: user.profilePicture,
                    isFollowing: following
                };
            });
            return filteredUsers;
        } catch (err) {
            return { error: "Error retrieving users" }
        }
    },
    createPost: async ({ content, referredTo, isActivated }, context) => {
        if (context.auth.user !== "user") {
            return { error: "You are not authorized to perform this action" };
        }
        const id = context.auth.id;
        try {
            var referrer = null;
            if (referredTo) {
                const previousPost = await Posts.findOne({ postId: { $eq: referredTo } });
                referrer = previousPost.id;
                if (!previousPost) {
                    return { error: "Post not found" }
                }
            }
            var isOnline = true;
            if (isActivated === false) {
                isOnline = false;
            }

            const post = {
                content: sanitizer_markdown(content),
                likes: [],
                users: [id],
                date: new Date().toISOString(),
                postId: crypto.randomUUID(),
                referredTo: referrer,
                isOnline: isOnline,
                mediaContent: []
            };

            const post_db = new Posts(post);
            await post_db.save();


            return { postId: post.postId };
        } catch (err) {
            console.log(err);
            return { error: "Error creating post" }
        }
    },
    getPosts: async ({ username }, context) => {
        try {
            const user = await User.findOne({ username: { $eq: username } });
            if (!user) {
                return { error: "User not found" }
            }
            const posts = await Posts.find({ users: { $in: user }, isOnline: { $eq: true }, referredTo: null });
            const filteredPosts = posts.map(async (post) => {
                const creators = post.users.map(async (user) => {
                    const user_r = await User.findById(user);
                    return {
                        username: user_r.username,
                        bio: user_r.bio,
                        role: user_r.role,
                        profilePicture: user_r.profilePicture
                    };
                });
                const likers = post.likes.map(async (user) => {
                    const user_r = await User.findById(user);
                    return {
                        username: user_r.username,
                        bio: user_r.bio,
                        role: user_r.role,
                        profilePicture: user_r.profilePicture
                    };
                });
                return {
                    content: post.content,
                    users: creators,
                    likes: likers,
                    date: post.date,
                    postId: post.postId,
                    mediaContent: post.mediaContent
                };
            }).reverse();
            return {error: null, posts: filteredPosts};
        } catch (err) {
            return { error: "Error retrieving posts" }
        }
    },
    likePost: async ({ postId }, context) => {
        if (context.auth.user !== "user") {
            return { error: "You are not authorized to perform this action" };
        }
        const id = context.auth.id;
        try {
            const post = await Posts.findOne({ postId: { $eq: postId } });
            if (!post) {
                return { error: "Post not found" }
            }
            const post_liked = await Posts.findByIdAndUpdate(
                post.id,
                { $addToSet: { likes: id } },
                { new: true }
            );
            return { success: true };
        } catch (err) {
            return { error: "Unexpected" }
        }
    },
    deletePost: async ({ postId }, context) => {
        if (context.auth.user !== "user") {
            return { error: "You are not authorized to perform this action" };
        }
        try {
            const post = await Posts.findOneAndDelete({ postId: { $eq: postId } });
            if (!post) {
                return { error: "Post not found" }
            }
            return { success: true };
        } catch (err) {
            return { error: "Unexpected error" }
        }
    },
    getPost: async ({ postId }, context) => {
        if (context.auth.user !== "user") {
            return { error: "You are not authorized to perform this action" };
        }
        const getProperties = async (post) => {
            const creators = post.users.map(async (user) => {
                const user_r = await User.findById(user);
                return {
                    username: user_r.username,
                    bio: user_r.bio,
                    role: user_r.role,
                    profilePicture: user_r.profilePicture
                };
            });
            const likers = post.likes.map(async (user) => {
                const user_r = await User.findById(user);
                return {
                    username: user_r.username,
                    bio: user_r.bio,
                    role: user_r.role,
                    profilePicture: user_r.profilePicture
                };
            });
            return { likers, creators };
        };
        try {
            const post_initial = await Posts.findOne({ postId: { $eq: postId } });
            if (!post_initial) {
                return { error: "Post not found" }
            }
            const { likes, creators } = await getProperties(post_initial);

            const linked_posts_unfiltered = await Posts.find({ referredTo: { $eq: post_initial.id } });

            const linked_posts = await linked_posts_unfiltered.map(async (post) => {
                const { likes, creators } = await getProperties(post);
                return {
                    content: post.content,
                    users: creators,
                    likes: likes,
                    date: post.date,
                    postId: post.postId,
                    mediaContent: post.mediaContent
                };
            });
            const post_data = {
                content: post_initial.content,
                users: creators,
                likes: likes,
                date: post_initial.date,
                postId: post_initial.postId,
                linked_posts: linked_posts,
                mediaContent: post_initial.mediaContent
            };
            return post_data
        } catch (err) {
            return { error: "Error retrieving post" }
        }
    },
    activatePost: async ({ postId }, context) => {
        if (context.auth.user !== "user") {
            return { error: "You are not authorized to perform this action" };
        }
        try {
            const post = await Posts.findOne({ postId: { $eq: postId } });
            if (!post) {
                return { error: "Post not found" }
            }
            const post_activated = await Posts.findByIdAndUpdate(
                post.id,
                { isOnline: true },
                { new: true }
            );
            return { success: true };
        } catch (err) {
            return { error: "Error activating post" }
        }
    }
};

module.exports = resolvers;
