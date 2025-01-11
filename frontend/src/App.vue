<template>
    <router-view />
</template>

<script>
export default {
    name: "App",
    mounted() {
        // Wait for route to resolve after mounting
        this.handleRouteChange();
    },
    watch: {
        // React to route changes if necessary
        $route: 'handleRouteChange',
    },
    methods: {
        handleRouteChange() {
            const routeName = this.$route.name;

            // Handle cases where the name might still be undefined
            //if (!routeName) return;

            /*if (routeName !== 'login' && routeName !== 'register') {
                if (localStorage.getItem('authToken')) {
                    this.$router.push({ name: 'home' });
                } else {
                    this.$router.push({ name: 'login' });
                }
            }*/
        },
    },
};
</script>
