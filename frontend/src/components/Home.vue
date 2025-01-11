<template>
    <div class="main-container">
        <h2>Create a Post</h2>
        <div class="image-upload">
            <label for="imageUpload" class="upload-button">
                Upload Image
            </label>
            <input type="file" id="imageUpload" accept="image/*" @change="handleImageUpload" style="display: none;" />
            <div class="image-previews">
                <div v-for="(image, index) in imagePreviews" :key="index" class="image-preview">
                    <img :src="image.previewUrl" alt="Uploaded Image Preview" />
                    <button @click="removeImage(index)" class="remove-button">
                        X
                    </button>
                </div>
            </div>
        </div>
        <textarea v-model="content" placeholder="Write something..." rows="4"></textarea>
        <button @click="createPost" class="post-button">Create Post</button>
        <p v-if="error" class="error">{{ error }}</p>
        <h2>Feed</h2>
        <div v-for="post in posts" :key="post.postId" class="post-card">
            <div class="post-header">
                <img :src="post.users[0].profilePicture == 'none' ? image : post.users[0].profilePicture" alt="User Profile"
                    class="profile-img">
                <h3 class="username">{{ post.users[0].username }}</h3>
            </div>
    <!-- Image Viewer Section -->
    <div v-if="post.mediaContent && post.mediaContent.length > 0">
      <ImageViewer :images="post.mediaContent" />
    </div>

            <p class="post-content" @click="openPost(post)">{{ post.content }}</p>
            <div class="post-footer">
                <span>{{ post.date }}</span>
                <div class="like-container">
                    <span class="likes-count">{{ post.likes.length }}</span>
                    <button @click="toggleLike(post)"
                        :class="{ 'liked': post.likes.find((user) => { return user.username == username }) ? true : false }"
                        class="like-button">
                        <i class="like-icon"></i>
                    </button>
                </div>
            </div>
        </div>
        <h2>Users you might know</h2>
        <div v-for="user in users" :key="user.username" class="user-card" @click="goToUser(user.username)">
            <img :src="user.profilePicture" alt="Profile Picture" class="profile-picture" />
            <div class="user-details">
                <h3>{{ user.username }}</h3>
                <p>{{ user.bio }}</p>
                <span class="role">{{ user.role }}</span>
            </div>
        </div>
    </div>
</template>
  
<script>
import image from "../assets/profile.png"
import ImageViewer from './ImageViewer.vue';
export default {
    data() {
        return {
            users: [], // Will hold the fetched users
            error: null, // For any errors during the fetch
            content: '',
            posts: [],
            image: image,
            username: '',
            imagePreviews: [], // Array to hold preview URLs and files
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
        try {
            const response = await fetch("http://localhost:4000/graphql", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                },
                body: JSON.stringify({ query }),
            });
            const { data, errors } = await response.json();
            if (errors) {
                this.error = errors[0]?.message || "An error occurred.";
            }
            else {
                this.users = data.getUsers;
                this.username = data.getUser.username;
            }
        }
        catch (err) {
            this.error = err.message;
        }
    },
    methods: {
        handleImageUpload(event) {
            const files = Array.from(event.target.files); // Convert FileList to Array
            files.forEach((file) => {
                const previewUrl = URL.createObjectURL(file); // Generate preview URL
                this.imagePreviews.push({ file, previewUrl }); // Add to previews array
            });
        },
        removeImage(index) {
            this.imagePreviews.splice(index, 1); // Remove image by index
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
            const content = this.content.replaceAll(re, "\\n",).replace(/[^a-zA-Z0-9\' ]/g, "");

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
            console.log(payload)
            const response = await fetch('http://localhost:4000/graphql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('authToken')}`,

                },
                body: JSON.stringify({
                    query: payload,
                }),
            });

            const { data } = await response.json();
            const post = data.createPost;
            if (post.error) {
                this.error = post.error;
            } else {
                if (this.imagePreviews.length !== 0) {
                    await this.uploadFilesSequentially(data.createPost.postId);
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

                // Add current file to FormData
                formData.append('file', imageObj.file);
                formData.append('postId', postId); // Add the postId to associate the file with the post

                // Upload file to /file/mediaUpload
                const uploadResponse = await fetch('http://localhost:4000/file/mediaUpload', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                    },
                    body: formData,
                });

                const uploadData = await uploadResponse.json();

                if (uploadData.errors) {
                    this.error = uploadData.errors[0].message;
                    return; // If upload fails, stop the process and show the error
                }
            }

            // After all files are uploaded, activate the post
            await this.activatePost(postId);
        },

        // Activate the post after all files are uploaded
        async activatePost(postId) {
            const mutation = `
        mutation ActivatePost {
            activatePost(postId: "${postId}") {
                success
                error
            }
        }
    `;

            const response = await fetch('http://localhost:4000/graphql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                },
                body: JSON.stringify({
                    query: mutation,
                }),
            });

            const data = await response.json();

            if (data.errors) {
                this.error = data.errors[0].message;
            } else {
                const post = data.data.activatePost;
                if (post.error) {
                    this.error = post.error;
                } else {
                    this.content = ''; // Clear the content after success
                    this.imagePreviews = []; // Clear the previews
                    this.fetchPosts(); // Fetch posts again
                }
            }
        },
        async fetchPosts() {
            const quer_self = `
            query GetUser {
                getUser {
                    profilePicture
                    username
                    error
                }
            }
        `;
            const response_username = await fetch('http://localhost:4000/graphql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('authToken')}`,

                },
                body: JSON.stringify({ query: quer_self }),
            });

            const { data: dataUser } = await response_username.json();

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
        }
    }
          }
        `;
            const response = await fetch('http://localhost:4000/graphql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('authToken')}`,

                },
                body: JSON.stringify({ query: query_posts }),
            });

            const { data } = await response.json();
            if (data.getNewestPosts.error) {
                this.error = data.getNewestPosts.error;
                return;
            }
            this.posts = data.getNewestPosts.posts;
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

            const response = await fetch('http://localhost:4000/graphql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('authToken')}`,

                },
                body: JSON.stringify({
                    query: mutation,
                }),
            });

            const { data } = await response.json();
            console.log(data.likePost.isLiked, post.postId)
            if (data.likePost.error) {
                this.error = data.likePost.error;
            } else {
                this.fetchPosts()
            }
        },
        openPost(post) {
            this.$router.push({ name: 'post', params: { postId: post.postId } });
        }
    },
    components: {
        ImageViewer
    }
};
</script>
  
<style scoped>
.user-card {
    cursor: pointer;
    display: flex;
    gap: 1rem;
    align-items: center;
    padding: 1rem;
    border: 1px solid #272323;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    background: #131212;
}

.profile-picture {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    object-fit: cover;
}

.user-details {
    flex: 1;
}

.user-details h3 {
    margin: 0 0 0.5rem;
    font-size: 1.2rem;
    color: #cfcfcf;
}

.user-details p {
    margin: 0;
    font-size: 1rem;
    color: #666;
}

.role {
    display: inline-block;
    margin-top: 0.5rem;
    padding: 0.2rem 0.5rem;
    font-size: 0.85rem;
    color: #fff;
    background: #007bff;
    border-radius: 4px;
}

.main-container {
    margin: 10px;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin: 2rem auto;
    max-width: 1000px;
    padding: 1rem;
    box-sizing: border-box;
    background-color: #000000;
    border-radius: 8px;
    width: 100%;
    margin: 0 auto;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    margin-top: 50px;
}

h2 {
    color: #6a1b9a;
    font-size: 1.5em;
    text-align: center;
    margin-bottom: 10px;
}

textarea {
    width: 100%;
    padding: 15px;
    border: 1px solid #2b2a33;
    border-radius: 10px;
    background-color: #2b2a33;
    font-size: 1.1em;
    resize: none;
    box-sizing: border-box;
    transition: all 0.3s ease;
    margin-bottom: 10px;
    outline: none;
    color: white;
}

textarea:focus {
    border-color: #8e24aa;
    box-shadow: 0 0 10px rgba(142, 36, 170, 0.3);
}


.post-button {
    background-color: #8e24aa;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    font-size: 1em;
    width: 100%;
    margin-top: 10px;
    cursor: pointer;
}

.post-button:hover {
    background-color: #7b1fa2;
}

.post-card {
    background-color: #080808;
    /* White for contrast */
    border-radius: 12px;
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.05);
    /* Soft shadow */
    border: solid 1px #242429;
    /* Subtle border */
    margin-bottom: 25px;
    padding: 20px;
    color: #b3b3b3;
    /* Deep purple */
    font-family: 'Roboto', sans-serif;
    transition: transform 0.2s, box-shadow 0.2s;
    /* Smooth hover effects */
}

.post-card:hover {
    transform: scale(1.02);
    /* Slight zoom on hover */
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    /* Enhanced shadow on hover */
}

.post-header {
    display: flex;
    align-items: center;
    border-bottom: 1px solid #e0e0e0;
    /* Divider between header and content */
    padding-bottom: 10px;
    margin-bottom: 10px;
}

.profile-img {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    border: 2px solid #6a1b9a;
    /* Add border for a polished look */
    margin-right: 15px;
}

.username {
    font-size: 1.2rem;
    font-weight: bold;
    color: #4a148c;
    font-family: 'Poppins', sans-serif;
    /* Stylish font */
}

.post-content {
    margin-top: 15px;
    font-size: 1.2rem;
    color: #ffffff;
    /* Neutral, readable text */
    line-height: 1.6;
    word-wrap: break-word;
    /* Better readability */
}

.divider {
    height: 1px;
    background-color: #e0e0e0;
    /* Subtle divider between sections */
    margin: 20px 0;
}

.like-container {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: Arial, sans-serif;
}

.likes-count {
    font-size: 14px;
    color: #555;
}

.like-button {
    position: relative;
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
    /* Heart Icon */
    background-size: cover;
    filter: grayscale(100%);
    transition: transform 0.3s ease, filter 0.3s ease;
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

.upload-button {
    display: inline-block;
    padding: 10px 20px;
    color: white;
    border: 1px solid #4a148c;
    cursor: pointer;
    border-radius: 5px;
    text-align: center;
    width: 100%;
}

.upload-button:hover {
    background-color: #790fcf;
}

.image-previews {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    /* Add spacing between previews */
    margin-top: 20px;
}

.image-preview {
    position: relative;
    width: 200px;
    /* Set consistent size for all images */
    height: 200px;
    /* Maintain square aspect ratio */
    overflow: hidden;
    /* Ensure the image fits inside */
    border: 1px solid #ddd;
    border-radius: 5px;
    background-color: #f9f9f9;
    /* Placeholder background for empty spaces */
    display: flex;
    align-items: center;
    justify-content: center;
}

.image-preview img {
    width: 100%;
    /* Scale the image to fit the container */
    height: 100%;
    object-fit: cover;
    /* Crop the image to fill the space */
}

.remove-button {
    position: absolute;
    top: 5px;
    right: 5px;
    background: rgba(255, 0, 0, 0.8);
    width: 30px;
    height: 30px;
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    padding: 8px;
    font-size: 12px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    transition: background 0.3s ease;
}

.remove-button:hover {
    background: rgba(255, 0, 0, 1);
}
</style>
  