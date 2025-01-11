<template>
    <Navbar />
    <div class="posts-container">
        <div v-if="error" class="error-box">{{ error }}</div>

        <div v-if="loading" class="loading">Loading...</div>
        <div v-else>
            <div class="profile-section">
                <img :src="user.profilePicture" alt="Profile Picture" class="profile-picture" />
                <h1 class="username">{{ user.username }}</h1>
                <p class="bio">{{ user.bio }}</p>
                <p class="role">Role: {{ user.role }}</p>
                <button class="follow-button">Follow</button>
            </div>
            <div v-for="post in posts" :key="post.postId" class="post-card">
                <div class="post-header">
                    <img :src="post.users[0].profilePicture" alt="User Profile" class="profile-img">
                    <h3 class="username">{{ post.users[0].username }}</h3>
                </div>
                <p class="post-content">{{ post.content }}</p>
                <div class="post-footer">
                    <span>{{ post.date }}</span>
                    <div class="like-container">
                        <span class="likes-count">{{ post.likes.length }}</span>
                        <button @click="toggleLike(post)" :class="{ 'liked': post.isLiked }" class="like-button">
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
import Navbar from '@/components/Navbar.vue';

export default {
    data() {
        return {
            user: {},
            posts: [],
            loading: true,
            error: null,
        };
    },
    mounted() {
        this.fetchPosts();
    },
    components: {
        Navbar,
    },
    methods: {
        async fetchPosts() {
            const username = this.$route.params.username
            const GET_PUBLIC_USER = `
            query GetPublicUser {
                getPublicUser(username: "${username}") {
                username
                error
                profilePicture
                bio
                role
                }
            }
            `;
            const query = `
          query {
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

            const user_response = await fetch('http://localhost:4000/graphql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('authToken')}`,

                },
                body: JSON.stringify({ query: GET_PUBLIC_USER }),
            });
            const result = await user_response.json();

            if (result.data.getPublicUser.error) {
                this.error = result.data.getPublicUser.error;
            } else {
                this.user = result.data.getPublicUser;
            }
            const response = await fetch('http://localhost:4000/graphql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query }),
            });

            const { data } = await response.json();
            if (data.getPosts.error) {
                this.error = data.getPosts.error;
                this.loading = false;
                return;
            }
            this.posts = data.getPosts.posts;
            this.loading = false;
        },
        toggleLike(post) {
            post.isLiked = !post.isLiked;
            const username = 'hardcoded_username'; // Use the actual username here.
            const isLiked = post.likes.some(like => like.username === username);

            if (isLiked) {
                // Remove the like (this should be a call to the backend to unlike the post)
                post.likes = post.likes.filter(like => like.username !== username);
            } else {
                // Add the like (this should be a call to the backend to like the post)
                post.likes.push({ username });
            }
        }
    },
};
</script>
  
<style scoped>
.posts-container {
    padding: 20px;
    background-color: #ece3f0;
    /* Light lavender */
    width: 60%;
    margin: 0 auto;
    /* Center the container */
    max-width: 100%;
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
    background-color: #ffffff;
    /* White for contrast */
    border-radius: 12px;
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.05);
    /* Soft shadow */
    border: solid 1px #d4d4d4;
    /* Subtle border */
    margin-bottom: 25px;
    padding: 20px;
    color: #4a148c;
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
    color: #333333;
    /* Neutral, readable text */
    line-height: 1.6;
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
    background-color: #ffcccc;
    box-shadow: 0 0 8px rgba(141, 97, 174, 0.3);
}

.like-button:hover {
    transform: scale(1.1);
}

.like-button:active {
    transform: scale(0.95);
}

.error-box {
    background-color: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
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
}</style>
  