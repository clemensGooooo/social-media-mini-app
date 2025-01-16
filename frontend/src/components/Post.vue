<template>
    <div class="post-container">
        <ErrorBox :message="error" @close="clearError" />
        <div v-if="loading" class="loading">Loading...</div>
        <div v-else-if="error">
            <ErrorBox :message="error" @close="clearError" />
        </div>
        <div v-else>
            <div class="master-post">
                <div class="post-header">
                    <img :src="post.users[0].profilePicture == 'none' ? image : post.users[0].profilePicture"
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

                <div class="post-content" v-html="markdown.render(post.content)"></div>
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
                <div class="comments-section">
                    <ul class="comments-list">
                        <li v-for="comment in post.comments" :key="comment.commentId" class="comment-item">
                            <strong>{{ comment.user.username }}:</strong> {{ comment.content }}
                        </li>
                    </ul>
                    <div class="comment-input-container">
                        <input type="text" v-model="content" placeholder="Write a comment..." class="comment-input" />
                        <button @click="addComment(post)" class="comment-button">Comment</button>
                    </div>
                </div>
            </div>
            <div v-for="post in posts" :key="post.postId" class="post-card">
                <div class="post-header">
                    <img :src="post.users[0].profilePicture == 'none' ? image : post.users[0].profilePicture"
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
                <div class="post-content" v-html="markdown.render(post.content)"></div>
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
import ImageViewer from './ImageViewer.vue';
import config from '@/config';
import markdownit from 'markdown-it'
import image from '@/assets/profile.png'
import ErrorBox from './ErrorBox.vue';
import { getDataGraphQL } from '@/assets/dataProvider';

const markdown = markdownit().disable(['image'])


export default {
    data() {
        return {
            posts: [],
            loading: true,
            error: null,
            followButtonText: 'Follow Request',
            isFollowButtonDisabled: false,
            username: '',
            post: {},
            content: "",
            markdown: markdown,
            image: image
        };
    },
    mounted() {
        this.fetchPosts();
    },
    components: {
        ImageViewer,
        ErrorBox
    },
    methods: {
        clearError() {
            this.error = null;
        },
        async fetchPosts() {
            const postId = this.$route.params.postId
            const query = `
            query GetPost {
    getPost(postId: "${postId}") {
        content
        date
        postId
        error
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
        linked_posts {
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
    },
    getUser {
        username
    }
}

            `;

            const { response, error } = await getDataGraphQL(query)

            if (error || response.getPost.error != null) {
                this.error = error || response.getPost.error;
                console.log(this.error)
            } else {
                this.posts = response.getPost.linked_posts
                this.post = response.getPost
                this.username = response.getUser.username
            }
            this.loading = false;
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
            } else {
                this.fetchPosts()
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

            const { response, error } = await getDataGraphQL(mutation)
            if (error || response.deletePost.error) {
                this.error = response.deletePost.error;
            } else {
                this.fetchPosts()
            }
        },
        async addComment() {
            if (!this.content.trim()) {
                this.error = 'Content cannot be empty!';
                return;
            }

            const content = btoa(this.content)
            const mutation = `
        mutation CreatePost {
          createPost(content: "${content}",referredTo: "${this.post.postId}") {
            postId
            error
          }
        }
      `;

            const { response, error } = await getDataGraphQL(mutation)

            if (error) {
                this.error = error
            } else {
                this.content = '';
                this.fetchPosts()
            }
        },

    },
};
</script>
  
<style scoped>
.post-container {
    padding: 20px;
    background-color: #000000;
    /* Light lavender */
    width: 60%;
    margin: 50px auto;
    /* Center the container */
    max-width: 100%;
    /* Use only 60% of the center space */
    border-radius: 10px;
    /* Rounded corners for the container */
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    /* Soft shadow */
    padding-bottom: 100px;
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
    /* Slight zoom on hover */
    box-shadow: 0 8px 16px rgba(100, 100, 100, 0.3);
    border-color: rgb(43, 41, 41);
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

.like-container {
    display: flex;
    align-items: center;
    float: right;
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

.username {
    font-size: 2em;
    font-weight: bold;
    margin-bottom: 10px;
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

.comments-section {
    margin-top: 20px;
    padding: 15px;
    background-color: #1a1a1a;
    /* Slightly lighter than the black background */
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.comments-list {
    list-style: none;
    padding: 0;
    margin: 0 0 15px 0;
}

.comment-item {
    padding: 5px 0;
    border-bottom: 1px solid #333;
    color: #d3d3d3;
    /* Light gray for text */
}

.comment-item:last-child {
    border-bottom: none;
}

.comment-input-container {
    display: flex;
    gap: 10px;
}

.comment-input {
    flex: 1;
    padding: 8px 12px;
    border: none;
    border-radius: 5px;
    background-color: #252525;
    color: #d3d3d3;
    font-family: 'Roboto', sans-serif;
}

.comment-input:focus {
    outline: 2px solid #6a1b9a;
    /* Purple border for focus */
}

.comment-button {
    padding: 8px 15px;
    background-color: #5e35b1;
    /* Deep purple */
    color: #fff;
    border: none;
    border-radius: 5px;
    font-family: 'Poppins', sans-serif;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.comment-button:hover {
    background-color: #7c4dff;
    /* Brighter purple */
}

.comment-button:active {
    background-color: #4a148c;
    /* Darker purple for active state */
}

.master-post {
    margin-bottom: 50px;
}
</style>
  