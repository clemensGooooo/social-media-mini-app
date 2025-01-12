<template>
    <div class="posts-container">

        <div v-if="loading" class="loading">Loading...</div>
        <div v-else>
            <div class="profile-section">
                <img :src="image" alt="Profile Picture" class="profile-picture" />
                <h1 class="username">{{ user.username }}</h1>
                <p class="bio">{{ user.bio }}</p>
                <p class="role">Role: {{ user.role }}</p>
                <button v-if="username != user.username" class="follow-button" @click="followRequest"
                    :disabled="isFollowButtonDisabled">{{ followButtonText
                    }}</button>
            </div>
            <div v-if="error" class="error-box">{{ error }}</div>
            <div v-for="post in posts" :key="post.postId" class="post-card">
                <div class="post-header">
                    <img :src="post.users[0].profilePicture == 'null' ? post.users[0].profilePicture : image"
                        alt="User Profile" class="profile-img">
                    <h3 class="username">{{ post.users[0].username }}</h3>
                    <button v-if="post.users.find((user) => user.username == username)" @click="deletePost(post)"
                        class="delete-post-button" title="Delete Post">
                        <svg class="delete-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                            width="20" height="20">
                            <path
                                d="M3 6h18v2H3V6zm2 3h14v13c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2V9zm3 3v7h2v-7H8zm4 0v7h2v-7h-2zm4 0v7h2v-7h-2zM9 4h6V2H9v2z" />
                        </svg>
                    </button>
                </div>
                <!-- Image Viewer Section -->
                <div v-if="post.mediaContent && post.mediaContent.length > 0">
                    <ImageViewer :images="post.mediaContent" />
                </div>
                <p class="post-content" @click="openPost(post)">{{ post.content }}</p>
                <div class="post-footer" @click="">
                    <span>{{ post.date }}</span>
                    <div class="like-container">
                        <span class="likes-count">{{ post.likes.length }}</span>
                        <button @click="toggleLike(post)"
                            :class="{ 'liked': post.likes.find((user) => { console.log(user, username); return user.username == username }) ? true : false }"
                            class="like-button">
                            <i class="like-icon"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    {{ }}
</template>
<script>
import axios from 'axios';
import image from "../assets/profile.png"
import ImageViewer from './ImageViewer.vue';
import config from '../config'
import { getDataGraphQL } from '@/assets/dataProvider';

export default {
    data() {
        return {
            user: {},
            posts: [],
            loading: true,
            error: null,
            followButtonText: 'Follow Request',
            isFollowButtonDisabled: false,
            username: '',
            image: image
        };
    },
    mounted() {
        this.fetchPosts();
    },
    methods: {
        async fetchPosts() {
            const username = this.$route.params.username
            const query = `
            query GetPublicUser {
                getPublicUser(username: "${username}") {
                username
                error
                profilePicture
                bio
                role
                }
                getUser {
        username
    }
    getPosts(username: "${username}") {
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


            const { response, error } = await getDataGraphQL(query);
            this.loading = false;
            if (error) this.error = error
            else {
                this.user = response.getPublicUser
                this.image = response.getPublicUser.profilePicture
                this.username = response.getUser.username
                this.posts = response.getPosts.posts;
                this.loading = false;
            }
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

            const response = await fetch(config.graphqlUrl, {
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

            if (data.likePost.error) {
                this.error = data.likePost.error;
            } else {
                this.fetchPosts()
            }
        },
        async followRequest() {
            const mutation = `
            mutation RequestFollow {
    requestFollow(username: "${this.$route.params.username}") {
        success
        error
    }
}
        `;
            const response = await axios.post(config.graphqlUrl, {
                query: mutation,
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                }
            });
            const { data } = response.data;
            if (data.requestFollow.error) {
                this.error = data.requestFollow.error;
            }
            else if (data.requestFollow.success) {
                this.followButtonText = 'Follow Requested';  // Change the button text
                this.isFollowButtonDisabled = true;  // Disable the button
            }
        },
        async deletePost(post) {
            const mutation = `
            mutation DeletePost {
    deletePost(postId: "${post.postId}") {
        success
        error
    }
}
`;

            const response = await fetch(config.graphqlUrl, {
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

            if (data.deletePost.error) {
                this.error = data.deletePost.error;
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
.posts-container {
    padding: 20px;
    background-color: #000000;
    /* Light lavender */
    width: 100%;
    margin: 50px auto;
    /* Center the container */
    max-width: 1000px;
    /* Use only 60% of the center space */
    border-radius: 10px;
    /* Rounded corners for the container */
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    /* Soft shadow */
    padding-bottom: 100px;
}

.title {
    font-size: 2.5rem;
    font-family: 'Poppins', sans-serif;
    /* Modern, clean font */
    color: #5e35b1;
    /* Deep purple */
    text-align: center;
    margin-bottom: 30px;
}

.loading {
    text-align: center;
    color: #5e35b1;
    font-size: 1.5rem;
    font-family: 'Roboto', sans-serif;
    font-style: italic;
    /* Subtle emphasis */
}

.post-card {
    background-color: #111111;
    /* White for contrast */
    border-radius: 12px;
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.05);
    /* Soft shadow */
    border: solid 1px #252525;
    /* Subtle border */
    margin-bottom: 25px;
    padding: 20px;
    color: #570bb3;
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
    font-weight: bold;
    color: #d3d3d3;
    font-family: 'Poppins', sans-serif;
    /* Stylish font */
}

.post-content {
    margin-top: 15px;
    font-size: 1.2rem;
    color: #c9c9c9;
    /* Neutral, readable text */
    line-height: 1.6;
    /* Better readability */
    word-wrap: break-word;
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

.error-box {
    background-color: #160b0c;
    color: #b17b80;
    border: 1px solid #5c1219;
    padding: 10px;
    border-radius: 5px;
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.profile-section {
    text-align: center;
    margin-bottom: 40px;
}

.profile-picture {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    border: 4px solid #fff;
    margin-bottom: 20px;
}

.username {
    font-size: 2em;
    font-weight: bold;
    margin-bottom: 10px;
}

.bio {
    font-size: 1.2em;
    margin-bottom: 10px;
}

.role {
    font-size: 1em;
    font-style: italic;
}

.follow-button {
    background-color: #6a1b9a;
    /* Purple background */
    color: white;
    /* White text */
    border: none;
    /* Remove default border */
    padding: 12px 24px;
    /* Add padding for size */
    font-size: 16px;
    /* Set font size */
    border-radius: 30px;
    /* Rounded corners */
    cursor: pointer;
    /* Pointer cursor on hover */
    transition: background-color 0.3s ease, transform 0.2s;
    /* Smooth transitions */
}

.follow-button:hover {
    background-color: #8e24aa;
    /* Lighter purple on hover */
    transform: scale(1.05);
    /* Slightly enlarge the button */
}

.follow-button:active {
    background-color: #4a0072;
    /* Darker purple when clicked */
    transform: scale(0.98);
    /* Slightly shrink on click */
}

.follow-button.disabled {
    background-color: #ccc;
    /* Light gray background */
    cursor: not-allowed;
    /* Disable pointer cursor */

}

.delete-post-button {
    background: none;
    border: none;
    cursor: pointer;
    margin-left: auto;
    padding: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    transition: all 0.3s ease;
    font-size: 0;
    /* Hide any default text */
}

.delete-post-button .delete-icon {
    width: 20px;
    height: 20px;
    background-image: url('https://cdn-icons-png.flaticon.com/512/1214/1214428.png');
    /* Trash bin icon */
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    filter: grayscale(100%);
    transition: transform 0.3s ease, filter 0.3s ease;
    fill: #ff5252;
    /* Red color for delete */
}

.delete-post-button:hover .delete-icon {
    filter: grayscale(0);
    transform: scale(1.2);
}

.delete-post-button:hover {
    background-color: rgba(255, 82, 82, 0.2);
    box-shadow: 0 0 8px rgba(255, 82, 82, 0.6);
}

.delete-post-button:active {
    transform: scale(0.95);
}
</style>
  