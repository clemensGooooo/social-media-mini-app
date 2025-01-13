<template>
    <nav class="navbar">
        <div class="navbar-left">
            <button class="navbar-item" @click="home">Home</button>
            <button class="navbar-item" @click="goToFollowers">
                Followers
                <span v-if="followerCount >= 1">({{ followerCount }})</span>
            </button>
            <button class="navbar-item" @click="goToSearch">Search</button>
        </div>

        <div class="navbar-right">
            <button class="navbar-item" @click="goToYourPosts">Your Posts</button>

            <img v-if="profileImage" :src="profileImage" alt="Profile" class="profile-image clickable" @click="profile" />

            <span v-else class="profile-placeholder clickable" @click="profile">
                Profile
            </span>
            <button class="navbar-item" @click="logout">Logout</button>
        </div>
    </nav>
</template>
  
<script>
import config from "@/config";
import image from "../assets/profile.png"


export default {
    data() {
        return {
            profileImage: null, // Will hold the profile image URL
            image: image,
            username: "",
            followerCount: 0,
        };
    },
    async created() {
        const query = `
        query GetUserProfile {
        getUser {
            profilePicture
            username
            followerRequest
          }
        }
      `;
        try {
            const response = await fetch(config.graphqlUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem('authToken')}`,

                },
                body: JSON.stringify({ query }),
            });
            const { data } = await response.json();
            this.profileImage = data.getUser.profilePicture;
            this.username = data.getUser.username
            this.followerCount = data.getUser.followerRequest

            if (this.profileImage == "none") {
                this.profileImage = image
            }
            if (data.getUser.username == null) {
                localStorage.removeItem("authToken");
                window.location.reload()
            }
        } catch (err) {
            console.error("Error fetching profile image:", err);
        }
    },
    methods: {
        goToSearch() {
            this.$router.push("/search");
        },
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
        goToYourPosts() {
            this.$router.push("/user/" + this.username);
        }
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
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    cursor: pointer;
}

.profile-placeholder {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #ccc;
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    font-size: 1rem;
    text-transform: uppercase;
}
.navbar-item span {
  font-weight: bold;
  margin-left: 0.5rem;
}
</style>
  