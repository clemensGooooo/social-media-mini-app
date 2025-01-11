<template>
    <Navbar />
    <div class="post-creation-container">
        <h2>Create a Post</h2>
        <textarea v-model="content" placeholder="Write something..." rows="4"></textarea>
        <button @click="createPost">Create Post</button>
        <p v-if="error" class="error">{{ error }}</p>
    </div>
    <div class="posts-container">
        <h3 class="title">Your last posts</h3>
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
    <div class="users-container">
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
import Navbar from './Navbar.vue';

export default {
    data() {
        return {
            users: [], // Will hold the fetched users
            error: null, // For any errors during the fetch
            content: '',
            posts: [],
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
          }
        }
      `;
        try {
            const response = await fetch("http://localhost:4000/graphql", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ query }),
            });
            const { data, errors } = await response.json();
            if (errors) {
                this.error = errors[0]?.message || "An error occurred.";
            }
            else {
                this.users = data.getUsers;
            }
        }
        catch (err) {
            this.error = err.message;
        }
    },
    methods: {
        goToUser(username) {
            console.log("Navigating to user:", username);
            this.$router.push({ name: 'user', params: { username: username } });
        },
        async createPost() {
            if (!this.content.trim()) {
                this.error = 'Content cannot be empty!';
                return;
            }

            const mutation = `
        mutation CreatePost {
          createPost(content: "${this.content}") {
            postId
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
                const post = data.data.createPost;
                if (post.error) {
                    this.error = post.error;
                } else {
                    this.content = '';
                    alert(`Post created with ID: ${post.postId}`);
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
            getPosts(username: "${dataUser.getUser.username}") {
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
                },
                body: JSON.stringify({ query: query_posts }),
            });

            const { data } = await response.json();
            if (data.getPosts.error) {
                this.error = data.getPosts.error;
                return;
            }
            this.posts = data.getPosts.posts;
        }
    },
    components: { Navbar }
};
</script>
  
<style scoped>
.users-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin: 2rem auto;
    max-width: 600px;
    padding: 1rem;
    box-sizing: border-box;
}

.user-card {
    cursor: pointer;
    display: flex;
    gap: 1rem;
    align-items: center;
    padding: 1rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    background: #fff;
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
    color: #333;
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

.post-creation-container {
    margin: 10px;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin: 2rem auto;
    max-width: 1000px;
    padding: 1rem;
    box-sizing: border-box;
    background-color: #f3e5f5;
    border-radius: 8px;
    width: 100%;
    margin: 0 auto;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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
    border: 1px solid #d1c4e9;
    border-radius: 10px;
    background-color: #ffffff;
    font-size: 1.1em;
    resize: none;
    box-sizing: border-box;
    transition: all 0.3s ease;
    margin-bottom: 10px;
    outline: none;
}

textarea:focus {
    border-color: #8e24aa;
    box-shadow: 0 0 10px rgba(142, 36, 170, 0.3);
}


button {
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

button:hover {
    background-color: #7b1fa2;
}

.posts-container {
    padding: 20px;
    background-color: #ece3f0;
    /* Light lavender */
    width: 100%;
    margin: 0 auto;
    /* Center the container */
    max-width: 1000px;
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
</style>
  