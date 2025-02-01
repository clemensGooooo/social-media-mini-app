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

        <img v-if="profileImage" :src="profileImage" alt="Profile" class="profile-image clickable" @click="settings" />

        <span v-else class="profile-placeholder clickable" @click="settings">
            Profile
        </span>
        <button class="navbar-item" @click="logout">Logout</button>
    </div>

    <!-- Mobile Hamburger Button -->
    <button class="hamburger-menu" @click="toggleMobileMenu">
        <span class="hamburger-bar"></span>
        <span class="hamburger-bar"></span>
        <span class="hamburger-bar"></span>
    </button>
    <span class="text-hamburger">Purple</span>
</nav>

<!-- Mobile Menu -->
<div v-if="isMobileMenuVisible" class="mobile-menu">
    <button class="navbar-item" @click="home">Home</button>
    <button class="navbar-item" @click="goToFollowers">
        Followers
        <span v-if="followerCount >= 1">({{ followerCount }})</span>
    </button>
    <button class="navbar-item" @click="goToSearch">Search</button>
    <button class="navbar-item" @click="goToYourPosts">Your Posts</button>
    <button class="navbar-item" @click="settings">Settings</button>
    <button class="navbar-item" @click="logout">Logout</button>
</div>
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
            isMobileMenuVisible: false,
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
        toggleMobileMenu() {
        this.isMobileMenuVisible = !this.isMobileMenuVisible;
    },
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
        settings() {
            this.$router.push("/settings");
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
    color: white;
    font-size: 1.1rem;
    position: relative;
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

/* Mobile Styles */
.hamburger-menu {
    display: none;
    background: none;
    border: none;
    cursor: pointer;
    flex-direction: column;
    gap: 5px;
}

.hamburger-bar {
    width: 25px;
    height: 3px;
    background-color: white;
}

.mobile-menu {
    margin: 5px;
    width: 90%;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    position: absolute;
    top: 60px;
    left: 20px;
    background-color: #6a1b9a;
    padding: 1rem;
    border-radius: 5px;
    z-index: 1;
}
.text-hamburger {
    display: none;
}

/* Media Query for Mobile */
@media (max-width: 768px) {
    .navbar-left,
    .navbar-right {
        display: none; /* Hide the navbar items */
    }

    .hamburger-menu {
        display: flex; /* Show the hamburger menu */
    }
    .text-hamburger {
        display: block;
    }
}

</style>
  