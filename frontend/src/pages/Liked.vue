<template>
    <div class="liked-page">
        <h2>Your liked posts</h2>
        <div v-for="post in posts" :key="post.username" class="post-card" @click="goToPost(post.postId)">
            <div class="post-header">
                <h3>{{ post.content }}</h3>
                <p class="date">{{ formatTime(post.date) }}</p>
            </div>
            <span class="user">{{ post.users[0].username }}</span>
        </div>
    </div>
</template>
  
<script>
import config from '@/config';
import { getDataGraphQL } from '@/assets/dataProvider';
import { formatTime } from '@/assets/utils';

export default {
    data() {
        return {
            posts: [],
        };
    },
    mounted() {
        this.fetchPosts();
    },
    methods: {
        formatTime,
        fetchPosts() {
            const query = `
            query GetLikedPosts {
                getLikedPosts {
                    content
                    date
                    postId
                    mediaContent
                    users {
                        username
                    }
                }
            }
            `;

            getDataGraphQL(query)
                .then(({ response }) => {
                    if (response.getLikedPosts) {
                        this.posts = response.getLikedPosts;
                    }
                })
                .catch((error) => {
                    console.error('Error fetching reports:', error);
                });
        },
        goToPost(postId) {
            console.log('postId', postId);
            this.$router.push({ name: 'post', params: { postId: postId } });
        },
    },
};
</script>
  
<style scoped>
.liked-page {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin: 2rem auto;
    max-width: 600px;
    padding: 1rem;
    box-sizing: border-box;
}

.post-card {
    text-align: left;
    background-color: #131212;
    border: 1px solid #2e2c2c;
    border-radius: 8px;
    padding: 1.5rem;
    max-width: 600px;
    width: 100%;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    cursor: pointer;
}

.post-header {
    text-align: left;
}

.post-details {
    margin-top: 1rem;
    word-wrap: break-word;
}
.report-highlighted {
    color: #9c27b0;
}
.user {
    color: #585858;
}
.date {
    color: #6d6d6d;
}
</style>
  