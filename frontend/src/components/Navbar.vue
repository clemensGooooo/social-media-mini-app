<template>
    <nav class="navbar">
        <div class="navbar-left">
            <button class="navbar-item" @click="home">Home</button>
            <button class="navbar-item" @click="goToFollowers">Followers</button>
        </div>

        <div class="navbar-right">
            <button class="navbar-item" @click="profile">
                <img v-if="profileImage" :src="profileImage" alt="Profile" class="profile-image" />
                <span v-else>Profile</span>
            </button>
            <button class="navbar-item" @click="logout">Logout</button>
        </div>
    </nav>
</template>
  
<script>
export default {
    data() {
        return {
            profileImage: null, // Will hold the profile image URL
        };
    },
    async created() {
        const query = `
        query GetUserProfile {
          getUsers {
            profilePicture
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
            const { data } = await response.json();
            // Assuming the first user in the list is the logged-in user
            this.profileImage = data.getUsers[0]?.profilePicture;
        } catch (err) {
            console.error("Error fetching profile image:", err);
        }
    },
    methods: {
        goToFollowers() {
            this.$router.push("/followers");
        },
        logout() {
            localStorage.removeItem("authToken");
            this.$router.push("/login");
        },
        profile() {
            this.$router.push("/profile");
        },
        home() {
            this.$router.push("/");
        },
    },
};
</script>
  
<style scoped>
.navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
    background-color: #6a1b9a;
    /* Purple theme */
    color: white;
    font-size: 1.1rem;
}

.navbar-left,
.navbar-right {
    display: flex;
    gap: 1.5rem;
}

.navbar-item {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    font-size: 1rem;
    padding: 0.5rem 1rem;
    border-radius: 5px;
    transition: background-color 0.3s;
}

.navbar-item:hover {
    background-color: #8e24aa;
    /* Hover effect with a slightly lighter purple */
}

.profile-image {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    object-fit: cover;
    margin-right: 0.5rem;
}
</style>
  