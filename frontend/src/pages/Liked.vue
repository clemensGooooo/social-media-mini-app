<template>
    <div class="page">
        <h2>Your liked posts</h2>
        <p>Click on them to view them (Images aren't displayed).</p>
        <div v-for="post in posts" :key="post.username" @click="goToPost(post.postId)" title="Click to view post" class="card">
            <div class="header">
                <h3>{{ post.content }}</h3>
                <p class="date">{{ formatTime(post.date) }}</p>
            </div>
            <span class="user">{{ post.users[0].username }}</span>
        <div class="divider"></div>
        </div>
    </div>
    <ErrorBox :message="error" @close="clearError"/>
</template>
  
<script>
import { getDataGraphQL } from '@/assets/dataProvider';
import { formatTime } from '@/assets/utils';
import ErrorBox from '@/components/ErrorBox.vue';

export default {
    data() {
        return {
            posts: [],
            error: ""
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
                    this.error = "There was an error fetching the liked posts, please try reloading!"
                });
        },
        goToPost(postId) {
            console.log('postId', postId);
            this.$router.push({ name: 'post', params: { postId: postId } });
        },
        clearError() {
            this.error = ""
        },
    },
    components: {
        ErrorBox
    }
};
</script>
  
<style scoped>
.page {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin: 2rem auto;
    max-width: 600px;
    padding: 1rem;
    box-sizing: border-box;
}

.header {
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
    display: block;
    width: 100%;
    position: static;
    text-align: right;
}
.date {
    color: #6d6d6d;
}
.divider {
    padding: 10px;
    border-bottom: 1px grey solid;
}
.card {
    cursor: pointer;
    
}
</style>
  