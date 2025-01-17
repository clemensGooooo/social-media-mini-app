<template>
    <button v-if="username !== user.username" :disabled="user.followed == 1"
        :class="'follow-button ' + (user.followed == 2 ? 'unfollow' : '')" @click="followButtonPress">
        {{ followButtonText }}
    </button>
</template>
<script>
import { getDataGraphQL } from '@/assets/dataProvider';

export default {
    props: {
        user: {
            type: Object,
            required: true
        },
        username: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            followButtonText: 'Follow Request',
        };
    },
    computed: {
        followButtonText() {
            if (this.user.followed === 2) return "Unfollow";
            if (this.user.followed === 1) return "Follow Requested";
            return "Request Follow";
        }
    },
    methods: {
        async followButtonPress() {
            console.log(this.user)
            if (this.user.followed == 0) {

                const mutation = `
                mutation RequestFollow {
                    requestFollow(username: "${this.$route.params.username}") {
                        success
                        error
                    }
                }
                `;
                const { response, error } = await getDataGraphQL(mutation);
                if (error) {
                    this.error = error;
                }
                else if (response.requestFollow.success) {
                    this.$emit('clicked');
                }
            } else if (this.user.followed == 2) {

                const mutation = `
                mutation UnFollow {
                    unFollow(username: "${this.$route.params.username}") {
                        success
                        error
                    }
                }
                `;

                const { response, error } = await getDataGraphQL(mutation);
                if (error) {
                    this.error = error;
                }
                else if (response.unFollow.success) {
                    this.$emit('clicked');
                }
            }
        }
    }
};
</script>
<style scoped>
.follow-button {
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

.follow-button:hover {
    background-color: #8e24aa;
    /* Lighter purple on hover */
    /* Slightly enlarge the button */
}

.follow-button:active {
    background-color: #4a0072;
    /* Darker purple when clicked */
    transform: scale(0.98);
    /* Slightly shrink on click */
}

.follow-button:disabled {
    color: red;
    background-color: #1f1d1d;
    /* Light gray background */
    cursor: not-allowed;
    /* Disable pointer cursor */

}

.follow-button.unfollow {
    color: red;
    background-color: #1f1d1d;
}
</style>