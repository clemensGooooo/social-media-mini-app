const User = require("../models/User");
const Reports = require("../models/Reports");
const { generateJWT } = require("../auth");
const { sanitizer_names, isEmailValid, sanitizer_bio } = require("../controllers/sanitizer");
const { generatePassword, checkPassword } = require("../controllers/password");
const Posts = require("../models/Posts");
const crypto = require("crypto");


const resolvers = {
    getUser: async (args, context) => {
        if (context.auth.user === "guest") {
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
            const users = await User.aggregate([{ $sample: { size: 10 } }]);
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
    getPublicUser: async ({ username }, context) => {
        if (context.auth.user === "guest") {
            return { error: "You are not authorized to perform this action" };
        }
        const id = context.auth.id;
        try {
            const user = await User.findOne({ username: { $eq: username } });
            // follower: 2, follow_requested: 1, not anything: 0
            let followed = user.followers.includes(id) ? 2 : 0;
            if (user.requested_followers.includes(id)) followed = 1

            return {
                username: user.username,
                bio: user.bio,
                role: user.role,
                profilePicture: user.profilePicture,
                followed: followed
            };
        } catch (err) {
            return { error: "Error retrieving user" }
        }
    },
    searchUsers: async ({ query }, context) => {
        if (context.auth.user === "guest") {
            return { error: "You are not authorized to perform this action" };
        }
        if (query.length < 2) {
            return { error: "Please make the input longer than two characters" };
        }
        const matching_users = await User.find({ username: { $regex: query, $options: 'i' } });
        const filteredUsers = matching_users.map(user => {
            return {
                username: user.username,
                bio: user.bio,
                role: user.role,
                profilePicture: user.profilePicture
            };
        });
        return filteredUsers
    },
    createUser: async ({ firstName, lastName, dateOfBirth, email, password, username, bio, isPrivate }, context) => {
        try {
            const role = isPrivate ? "user_private" : "user_public"
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
        if (context.auth.user === "guest") {
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
        if (context.auth.user === "guest") {
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
        if (context.auth.user === "guest") {
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
            if (user.role == "user_public") {
                await User.findByIdAndUpdate(
                    user.id,
                    { $addToSet: { followers: id } },
                    { new: true }
                );
            } else {
                await User.findByIdAndUpdate(
                    user.id,
                    { $addToSet: { requested_followers: id } },
                    { new: true }
                );
            }
            return { success: true };
        } catch (err) {
            return { error: "Unexpected" }
        }
    },
    unFollow: async ({ username }, context) => {
        if (context.auth.user === "guest") {
            return { error: "You are not authorized to perform this action" };
        }
        const id = context.auth.id;
        try {
            const user = await User.findOne({ username });
            if (!user) {
                return { error: "User not found" }
            }
            await User.findByIdAndUpdate(
                user.id,
                { $pull: { followers: id } },
                { new: true }
            );
            return { success: true };
        } catch (err) {
            return { error: "Unexpected" }
        }
    },
    getFollowRequests: async (args, context) => {
        if (context.auth.user === "guest") {
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
        if (context.auth.user === "guest") {
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
        if (context.auth.user === "guest") {
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

        if (context.auth.user === "guest") {
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
        if (context.auth.user === "guest") {
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
            content = decodeURIComponent(escape(atob(content)))
            const post = {
                content: content,
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
        if (context.auth.user === "guest") {
            return { error: "You are not authorized to perform this action" };
        }
        const id = context.auth.id;

        try {
            const user = await User.findOne({ username: { $eq: username } });
            if (!user) {
                return { error: "User not found" }
            }
            if (user.followers.find((follower) => { return follower._id.toString() == id }) || user._id == id || user.role == "user_public") {

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
                return { error: null, posts: filteredPosts };
            } else {
                return { error: "Become a follower to see the posts!" };
            }
        } catch (err) {
            return { error: "Error retrieving posts" }
        }
    },
    getNewestPosts: async (args, context) => {
        if (context.auth.user === "guest") {
            return { error: "You are not authorized to perform this action" };
        }
        const id = context.auth.id;
        try {
            const users = await User.find({$or: [{ followers: { $in: id } },{role: {$eq: "user_public"}}]});
            const followers = users.map((user) => user._id);
            const userPosts = await Posts.find({
                $and: [{
                    $or: [{ users: { $in: followers } },
                    { users: { $in: id } }]
                },
                    { referredTo: null }
                ]
            })
            .sort({ date: -1 })
            .limit(15);
            
            const newestPosts = [...userPosts];

            const filteredPosts = newestPosts.map(async (post) => {
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
                const commentCount = await Posts.find({ referredTo: { $eq: post.id } }).countDocuments();
                return {
                    content: post.content,
                    users: creators,
                    likes: likers,
                    date: post.date,
                    postId: post.postId,
                    mediaContent: post.mediaContent,
                    commentCount: commentCount
                };
            })
            return { posts: filteredPosts };
        } catch (err) {
            console.log(err)
            return { error: "Error retrieving newest posts" };
        }
    },
    likePost: async ({ postId, remove }, context) => {
        if (context.auth.user === "guest") {
            return { error: "You are not authorized to perform this action" };
        }
        if (remove === undefined) {
            remove = true;
        }
        const id = context.auth.id;
        try {
            const post = await Posts.findOne({ postId: { $eq: postId } });
            if (!post) {
                return { error: "Post not found" }
            }
            if (post.likes.find((user) => user._id == id) && remove) {
                const post_liked = await Posts.findByIdAndUpdate(
                    post.id,
                    { $pull: { likes: id } },
                    { new: true }
                );
                return { success: true, isLiked: false };
            } else {
                const post_liked = await Posts.findByIdAndUpdate(
                    post.id,
                    { $addToSet: { likes: id } },
                    { new: true }
                );
                return { success: true, isLiked: true };
            }

        } catch (err) {
            return { error: "Unexpected" }
        }
    },
    deletePost: async ({ postId }, context) => {
        if (context.auth.user === "guest") {
            return { error: "You are not authorized to perform this action" };
        }
        try {
            const post = await Posts.findOne({ postId: { $eq: postId } });
            if (!post) {
                return { error: "Post not found" };
            }

            if (!post.users.includes(context.auth.id)) {
                return { error: "You are not authorized to delete this post" };
            }
            await Posts.deleteOne({ postId: { $eq: postId } });
            return { success: true };
        } catch (err) {
            return { error: "Unexpected error" }
        }
    },
    getPost: async ({ postId }, context) => {
        if (context.auth.user === "guest") {
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
            const likes = post.likes.map(async (user) => {
                const user_r = await User.findById(user);
                return {
                    username: user_r.username,
                    bio: user_r.bio,
                    role: user_r.role,
                    profilePicture: user_r.profilePicture
                };
            });
            return { likes, creators };
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
        if (context.auth.user === "guest") {
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
    },
    createReport: async ({ type, description }, context) => {
        if (context.auth.user === "guest") {
            return { error: "You are not authorized to perform this action" };
        }
        try {
            const report = {
                type,
                description: atob(description),
                user: context.auth.id,
                date: new Date().toISOString(),
                status: 0
            };
            await Reports.create(report);
            return { success: true };
        } catch (err) {
            return { error: "Error reporting" }
        }
    },
    getReports: async (args, context) => {
        if (context.auth.user === "guest") {
            return { error: "You are not authorized to perform this action" };
        }
        try {
            const reports = await Reports.find({ user: context.auth.id }).sort({ date: -1 });
            return reports.map(report => {
                    return {
                        type: report.type,
                        description: report.description,
                        post: report.post || "",
                        date: report.date,
                        status: report.status
                    };
                });
        } catch (err) {
            return { error: "Error retrieving reports" }
        }
    },
    getLikedPosts: async (args, context) => {
        if (context.auth.user === "guest") {
            return { error: "You are not authorized to perform this action" };
        }
        try {
            const posts = await Posts.find({ likes: { $in: context.auth.id } });
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
            });
            return filteredPosts;
        } catch (err) {
            return { error: "Error retrieving liked posts" }
        }
    },
    getFollowed: async (args, context) => {
        if (context.auth.user === "guest") {
            return { error: "You are not authorized to perform this action" };
        }
        try {
            const users = await User.find({ followers: { $in: context.auth.id } });
            const filteredUsers = users.map((user) => {
                return {
                    username: user.username,
                    bio: user.bio,
                    role: user.role,
                    profilePicture: user.profilePicture,
                };
            });
            
            return filteredUsers;
        } catch (err) {
            return { error: "Error retrieving liked posts" }
        }
    },
};

module.exports = resolvers;
