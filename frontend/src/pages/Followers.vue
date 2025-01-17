<template>
    <div class="users-container">
        <h2>Your followers</h2>
        <p>You have {{ count }} follower(s).</p>
        <div v-if="requests.length != 0">
            <h4>You have a follower request</h4>
            <div v-for="user in requests" :key="user.username" class="user-card special">
                <img @click="goToUser(user)" :src="user.profilePicture == 'null' ? user.profilePicture : image" alt="Profile Picture" class="profile-picture" />
                <div class="user-details">
                    <h3>{{ user.username }}</h3>
                    <p>{{ user.bio }}</p>
                    <span class="role">{{ user.role }}</span>
                </div>
                <button class="accept-button" @click="acceptFollow(user)">Accept</button>
            </div>
        </div>
        <div v-for="user in users" :key="user.username" class="user-card" @click="goToUser(user.username)">
            <img :src="user.profilePicture == 'null' ? user.profilePicture : image" alt="Profile Picture" class="profile-picture" />
            <div class="user-details">
                <h3>{{ user.username }}</h3>
                <p>{{ user.bio }}</p>
                <span class="role">{{ user.role }}</span>
            </div>
        </div>
    </div>
</template>

  
<script>

import { getDataGraphQL } from '@/assets/dataProvider';
import image from '../assets/profile.png'
export default {
    data() {
        return {
            users: [],
            requests: [],
            error: null,
            count: 0,
            image: image
        };
    },
    async created() {
        await this.fetchFollowers();
    },
    methods: {
        goToUser(username) {
            this.$router.push(`/user/${username}`);
        },
        async acceptFollow(user) {
            const query = `
            mutation AcceptFollow {
                acceptFollow(username: "${user.username}") {
                    success
                    error
                }
            }
            `;
            const {error} = await getDataGraphQL(query)

            if (error) {
                this.error = error;
            }
            else {
                this.fetchFollowers()
            }
        },
        async fetchFollowers() {
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
                getFollowRequests {
                    username
                    error
                    profilePicture
                    bio
                    role
                }
            }
            `;
            try {
                const {response,error} = await getDataGraphQL(query)

                if (error) {
                    this.error = error || "An error occurred.";
                }
                else {
                    this.users = response.getFollowers;
                    this.requests = response.getFollowRequests;
                    this.count = this.users.length;
                }
            }
            catch (err) {
                this.error = err.message;
            }
        }
    },
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
    border: 1px solid #2e2c2c;
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
    color: #adacac;
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

.special {
    background-color: rgb(19, 22, 31);
    border-color: #007bff;
}

.accept-button {
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

.accept-button:hover {
    background-color: #8e24aa;
    /* Lighter purple on hover */
    transform: scale(1.05);
    /* Slightly enlarge the button */
}
</style>
  