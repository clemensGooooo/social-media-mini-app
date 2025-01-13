<template>
    <div class="main-container">
        <div class="search-bar">
            <input type="text" v-model="query" @input="searchOnChange" placeholder="Search..." class="search-input" />
        </div>
        <div v-if="users.length > 0" class="user-output">
            <div v-for="user in users" :key="user.username" class="user-card" @click="goToUser(user.username)">
                <img :src="user.profilePicture" alt="Profile Picture" class="profile-picture" />
                <div class="user-details">
                    <h3>{{ user.username }}</h3>
                    <p>{{ user.bio }}</p>
                    <span class="role">{{ user.role }}</span>
                </div>
            </div>
        </div>
        <div v-else>
            Please enter more than 2 letters to get results, the results will show up automatically.
        </div>
    </div>
</template>
<script>
import { getDataGraphQL } from '@/assets/dataProvider'
export default {
    data() {
        return {
            user: {},
            users: [],
            loading: true,
            error: null,
            query: "",
        };
    },
    methods: {
        async searchOnChange() {
            const query = `
            query SearchUsers {
    searchUsers(query: "${this.query}") {
        username
        error
        profilePicture
        bio
        role
    }
}
      `;
            if (query.length < 2) {
                return
            }
            const { response, error } = await getDataGraphQL(query)
            if (error != null) this.error = error;
            this.users = response.searchUsers;

        },
    }
}

</script>
<style scoped>
.user-output {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-top: 30px;
}

.search-bar {
    display: flex;
    align-items: center;
    background-color: #000;
    /* Black theme */
    border: 2px solid #6c63ff;
    /* Purple primary color */
    border-radius: 25px;
    padding: 5px 10px;
    width: 100%;
    max-width: 700px;
    margin: auto;
    margin-top: 50px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.search-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: #fff;
    /* White text */
    font-size: 16px;
    padding: 5px 10px;
}

.search-input::placeholder {
    color: #aaa;
    /* Grey placeholder text */
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
</style>