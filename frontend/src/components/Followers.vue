<template>
    <Navbar />
    <div class="users-container">
        <h2>Your followers</h2>
        <p>You have {{ count }} followers.</p>
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
            count: 0,
        };
    },
    async created() {
        const query = `
        query GetUsers {
            getFollowers {
        username
        error
        profilePicture
        bio
        role
        isFollowing
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
                this.users = data.getFollowers;
                this.count = this.users.length;
            }
        }
        catch (err) {
            this.error = err.message;
        }
    },
    methods: {
        goToUser(username) {
            this.$router.push(`/user/${username}`);
        },
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
</style>
  