<template>
    <div class="settings-container">
        <h2>Settings</h2>
        <div class="settings-card" @click="goToProfile">
            <h3>Profile</h3>
            <p>Go here to edit your profile, you can edit your profile picture, username, name and more..</p>
            <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 5l8 7-8 7" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
        </div>
        <div class="settings-card" @click="goToReports">
            <h3>Reports</h3>
            <p>Go here to review the reports and their status you submitted to our page and do more..</p>
            <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 5l8 7-8 7" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
        </div>
        <div class="settings-card" @click="goToLiked">
            <h3>Liked</h3>
            <p>Go here to view the posts you liked and go to these posts to inspect/unlike them..</p>
            <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 5l8 7-8 7" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
        </div>

    </div>
</template>


<script>

export default {
    data() {
        return {
        };
    },
    methods: {
        goToProfile() {
            this.$router.push('/profile');
        },
        goToReports() {
            this.$router.push('/reports');
        },
        goToLiked() {
            this.$router.push('/liked');
        },
    },
};
</script>

<style scoped>
.settings-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin: 2rem auto;
    max-width: 600px;
    padding: 1rem;
    padding-top: 2rem;
    box-sizing: border-box;
}

.settings-card {
    cursor: pointer;
    gap: 1rem;
    align-items: center;
    padding: 1rem;
    border: 1px solid #2e2c2c;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    background: #131212;
    display: flex;
    align-items: center;
    position: relative;
}

.settings-card h3 {
    font-size: 1.3rem;
    flex-grow: 1; /* Ensures the text stays on the left */
}

.settings-card p {
    font-size: 0.9rem;
    color: #666;
    flex-grow: 1; /* Ensures the text stays on the left */

}

.settings-card:hover {
    background: #1a1818;
}
.settings-card svg {
    display: inline-block;
    right: 0;
    margin-left: auto; /* Pushes the SVG to the right */
}
</style>