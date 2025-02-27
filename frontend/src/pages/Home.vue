<template>
    <div class="main-container">
        <div class="post-card">
            <div class="post-header">
                <h3 class="username">You: {{ username }}</h3>
            </div>
            <textarea v-model="content" placeholder="Write something..." rows="4"></textarea>
            <div class="image-upload">
                <input type="file" id="imageUpload" accept="image/*" @change="handleImageUpload"
                    style="display: none;" />
                <ImagePreviewsC :imagePreviews="imagePreviews" @remove="removeImage" />
            </div>
            <div class="post-buttons">
                <label for="imageUpload" class="upload-btn">
                    Upload Image
                </label>
                <button @click="createPost" class="create-post-btn">Create Post</button>
            </div>
            <p v-if="error" class="error">{{ error }}</p>
        </div>

        <div v-for="post in posts" :key="post.postId" class="post-card">
            <div class="post-header">
                <img :src="post.users[0].profilePicture == 'none' ? image : post.users[0].profilePicture"
                    alt="User Profile" class="profile-img" @click="goToUser(post.users[0].username)">
                <h3 class="username">{{ post.users[0].username }}</h3>
            </div>
            <!-- Image Viewer Section -->
            <div v-if="post.mediaContent && post.mediaContent.length > 0">
                <ImageViewer :images="post.mediaContent" />
            </div>

            <div class="post-content" v-html="markdown.render(post.content)"></div>
            <div class="post-footer">
                <span>{{ formatTime(post.date) }}</span>
                <div class="like-container">
                    <span class="likes-count">{{ post.likes.length }}</span>
                    <button @click="toggleLike(post)"
                        :class="{ 'liked': post.likes.find((user) => { return user.username == username }) ? true : false }"
                        class="like-button">
                        <i class="like-icon"></i>
                    </button>
                    <span class="likes-count">{{ post.commentCount }}</span>
                    <button @click="openPost(post)"
                        class="like-button comment-button">
                        <i class="like-icon"></i>
                    </button>
                </div>
                <div class="goToPost-container">
                    <button class="goToPost" @click="openPost(post)">
                        Comment & More
                    </button>
                </div>
            </div>
        </div>
        <h2>Users you might know</h2>
        <div v-for="user in users" :key="user.username" class="user-card" @click="goToUser(user.username)">
            <img :src="user.profilePicture== 'none' ? image : user.profilePicture" alt="Profile Picture" class="profile-picture" />
            <div class="user-details">
                <h3>{{ user.username }}</h3>
                <p>{{ user.bio }}</p>
                <span class="role">{{ user.role == "user_public"? "Public" : "Private"  }}</span>
            </div>
        </div>
    </div>
</template>

<script>
import config from "@/config";
import image from "../assets/profile.png"
import ImageViewer from '../components/ImageViewer.vue';
import { getDataGraphQL } from "@/assets/dataProvider";
import markdownit from 'markdown-it'
import ImagePreviewsC from '../components/ImagePreviewsC.vue'
import { formatTime } from "@/assets/utils";

const markdown = markdownit().disable(['image'])


export default {
    data() {
        return {
            users: [],
            error: null,
            content: '',
            posts: [],
            image: image,
            username: '',
            imagePreviews: [],
            markdown: markdown
        };
    },
    mounted() {
        this.fetchPosts();
    },
    async created() {
        const query = `
            query GetUsers {
                getUsers {
                    username
                    error
                    profilePicture
                    bio
                    role
                },
                getUser {
                    username
                }
            }
        `;
        const { response, error } = await getDataGraphQL(query)
        if (error != null) this.error = error;
        this.users = response.getUsers;
        this.username = response.getUser.username;

    },
    methods: {
        formatTime,
        handleImageUpload(event) {
            const files = Array.from(event.target.files);
            files.forEach((file) => {
                const previewUrl = URL.createObjectURL(file);
                this.imagePreviews.push({ file, previewUrl });
            });
        },
        removeImage(index) {
            this.imagePreviews.splice(index, 1);
        },
        goToUser(username) {
            this.$router.push({ name: 'user', params: { username: username } });
        },
        async createPost() {
            if (!this.content.trim()) {
                this.error = 'Content cannot be empty!';
                return;
            }
            var re = new RegExp(/\n/, 'g');
            const content = btoa(unescape(encodeURIComponent(this.content)));

            const normal = `
                mutation CreatePost {
                    createPost(content: "${content}") {
                        postId
                        error
                    }
                }
            `;
            const special = `
                mutation CreatePost {
                    createPost(content: "${content}", isActivated: false) {
                        postId
                        error
                    }
                }
            `;
            const payload = this.imagePreviews.length === 0 ? normal : special;

            const { error, response } = await getDataGraphQL(payload)
            const post = response.createPost;
            if (post.error) {
                this.error = post.error;
            } else {
                if (this.imagePreviews.length !== 0) {
                    await this.uploadFilesSequentially(response.createPost.postId);
                } else {
                    this.content = ""
                    this.fetchPosts()
                }
            }
        },
        async uploadFilesSequentially(postId) {
            for (let i = 0; i < this.imagePreviews.length; i++) {
                const imageObj = this.imagePreviews[i];
                const formData = new FormData();

                formData.append('file', imageObj.file);
                formData.append('postId', postId);

                const uploadResponse = await fetch(config.image_upload, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                    },
                    body: formData,
                });

                const uploadData = await uploadResponse.json();

                if (uploadData.errors) {
                    this.error = uploadData.errors[0].message;
                    return;
                }
            }

            await this.activatePost(postId);
        },

        async activatePost(postId) {
            const mutation = `
                mutation ActivatePost {
                    activatePost(postId: "${postId}") {
                        success
                        error
                    }
                }
            `;

            const { response, error } = await getDataGraphQL(mutation)
            if (error != null) this.error = error;
            else {
                this.content = '';
                this.imagePreviews = [];
                this.fetchPosts();
            }
        },
        async fetchPosts() {

            const query_posts = `
                query {
                    getNewestPosts {
                        error
                        posts {
                            content
                            date
                            postId
                            mediaContent
                            users {
                                username
                                error
                                profilePicture
                                bio
                                role
                            }
                            likes {
                                username
                                error
                                profilePicture
                                bio
                                role
                            }
                            commentCount
                        }
                    }
                    getUser {
                            profilePicture
                            username
                            error
                        }
                }
        `;
            const { response, error } = await getDataGraphQL(query_posts)
            if (error) {
                this.error = error;
                return;
            }
            console.log(response.getNewestPosts.posts)
            this.posts = response.getNewestPosts.posts;
        },
        async toggleLike(post) {

            const mutation = `
                mutation LikePost {
                    likePost(postId: "${post.postId}") {
                        success
                        error
                        isLiked
                    }
                }
            `;

            const { error } = await getDataGraphQL(mutation)
            if (error) {
                this.error = error;
                return;
            }
            this.fetchPosts()
        },
        openPost(post) {
            this.$router.push({ name: 'post', params: { postId: post.postId } });
        }
    },
    components: {
        ImageViewer,
        ImagePreviewsC
    }
};
</script>

<style scoped>
.post-buttons {
    display: flex;
    justify-content: space-between;
    margin-top: 10px;
}

/* Upload button */
.upload-btn {
    background: transparent;
    color: #8A2BE2;
    border: 2px solid #8A2BE2;
    padding: 8px 15px;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.3s;
}

.upload-btn:hover {
    background: #8A2BE2;
    color: white;
}

/* Create post button */
.create-post-btn {
    background: #8A2BE2;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease-in-out;
}

.create-post-btn:hover {
    background: #a855f7;
    box-shadow: 0 0 10px rgba(138, 43, 226, 0.8);
}

/* Upload button */
.upload-btn {
    background: transparent;
    color: #8A2BE2;
    border: 2px solid #8A2BE2;
    padding: 8px 15px;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.3s;
}

.upload-btn:hover {
    background: #8A2BE2;
    color: white;
}

/* Create post button */
.create-post-btn {
    background: #8A2BE2;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease-in-out;
}

.create-post-btn:hover {
    background: #a855f7;
    box-shadow: 0 0 10px rgba(138, 43, 226, 0.8);
}

/* User Card */
.user-card {
    cursor: pointer;
    display: flex;
    gap: 1.2rem;
    align-items: center;
    padding: 1.2rem;
    border: 1px solid #272727;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    background: #121212;
    transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.user-card:hover {
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
}

.profile-picture {
    width: 70px;
    height: 70px;
    border-radius: 50%;
    object-fit: cover;
}

.user-details {
    flex: 1;
}

.user-details h3 {
    margin: 0 0 0.5rem;
    font-size: 1.3rem;
    color: #e0e0e0;
    font-family: 'Poppins', sans-serif;
}

.user-details p {
    margin: 0;
    font-size: 1rem;
    color: #9e9e9e;
    font-family: 'Roboto', sans-serif;
}

.role {
    display: inline-block;
    margin-top: 0.5rem;
    padding: 0.3rem 0.6rem;
    font-size: 0.9rem;
    color: #fff;
    background: #6a1b9a;
    border-radius: 6px;
    font-weight: 500;
}


h2 {
    color: #8e24aa;
    font-size: 2rem;
    text-align: center;
    margin-bottom: 10px;
}

textarea {
    width: 100%;
    padding: 15px;
    border: 1px solid #2b2a33;
    border-radius: 12px;
    background-color: #2b2a33;
    font-size: 1.1em;
    resize: none;
    box-sizing: border-box;
    transition: all 0.3s ease;
    outline: none;
    color: #fff;
    margin-bottom: 5px;
}

textarea:focus {
    border-color: #8e24aa;
    box-shadow: 0 0 10px rgba(142, 36, 170, 0.3);
}

/* Post Card */
.post-card {
    background-color: #0d0d0d;
    border-radius: 12px;
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.05);
    border: solid 1px #2c2c2c;
    margin-bottom: 25px;
    padding: 20px;
    color: #e0e0e0;
    font-family: 'Roboto', sans-serif;
    transition: transform 0.2s, box-shadow 0.2s;
}

.post-card:hover {
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.post-header {
    display: flex;
    align-items: center;
    border-bottom: 1px solid #3e3e3e;
    padding-bottom: 10px;
    margin-bottom: 10px;
}

.profile-img {
    cursor: pointer;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    border: 2px solid #6a1b9a;
    margin-right: 15px;
}

.username {
    font-size: 1.3rem;
    font-weight: bold;
    color: #6a1b9a;
    font-family: 'Poppins', sans-serif;
}

.post-content {
    margin-top: 15px;
    font-size: 1.1rem;
    color: #fff;
    line-height: 1.6;
    word-wrap: break-word;
}

.divider {
    height: 1px;
    background-color: #3e3e3e;
    margin: 20px 0;
}

/* Like Button */
.like-container {
    display: flex;
    align-items: center;
    gap: 5px;
}

.likes-count {
    font-size: 14px;
    color: #b3b3b3;
}

.like-button {
    background: none;
    border: none;
    cursor: pointer;
    outline: none;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    transition: all 0.3s ease;
}

.like-button .like-icon {
    width: 20px;
    height: 20px;
    background-image: url('https://cdn-icons-png.flaticon.com/512/833/833472.png');
    background-size: cover;
    filter: grayscale(100%);
    transition: transform 0.3s ease, filter 0.3s ease;
}
.comment-button .like-icon {
    background-image: url('https://cdn-icons-png.flaticon.com/512/1380/1380338.png');
    filter: invert(1) brightness(60%) grayscale(100%);
}

.like-button.liked .like-icon {
    filter: grayscale(0);
    transform: scale(1.2);
}

.like-button.liked {
    background-color: #2e2e2e;
    box-shadow: 0 0 8px rgba(141, 97, 174, 0.3);
}

.like-button:hover {
    transform: scale(1.1);
}

.like-button:active {
    transform: scale(0.95);
}

.post-footer {
    position: relative;
    /* Makes the div the positioning reference */

}

.goToPost {
    position: absolute;
    bottom: 10px;
    right: 10px;
    padding: 5px 20px;
    background-color: transparent;
    color: #7700ff;
    border: 2px solid #7700ff;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
}

.goToPost:hover {
    background-color: #7700ff;
    color: #fff;
}
</style>