

<script>

import Navbar from '@/components/Navbar.vue';
import Footer from '@/components/Footer.vue';

export default {
    name: "App",
    mounted() {
        // Wait for route to resolve after mounting
        this.handleRouteChange();
        window.addEventListener('storage', this.handleStorageChange);
    },
    beforeDestroy() {
        // Clean up event listener
        window.removeEventListener('storage', this.handleStorageChange);
    },
    watch: {
        $route: 'handleRouteChange',
    },
    components: {
        Navbar,
        Footer
    },
    data() {
        return {
            state: false
        }
    },
    methods: {
        handleRouteChange() {
            const routeName = this.$route.name;
            if (!routeName) return;

            if (!localStorage.getItem('authToken')) {
                if (routeName !== 'login' && routeName !== 'register' && routeName !== 'about') {
                    this.$router.push({ name: 'login' });
                }
            }
            if  (!localStorage.getItem('authToken')) {
                this.state = false
            } else {
                this.state = true
            }
        }
    },
};
</script>
<template>
    <Navbar v-if="state" />

    <router-view />

    <Footer />
</template>