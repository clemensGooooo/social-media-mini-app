<template>
    <div class="register-container">
        <h1 class="register-title">Register</h1>
        <form @submit.prevent="register" class="register-form">
            <label for="username" class="register-label">Username:</label>
            <input type="text" id="username" v-model="username" class="register-input" placeholder="Enter your username" required>

            <label for="firstName" class="register-label">First Name:</label>
            <input type="text" id="firstName" v-model="firstName" class="register-input" placeholder="Enter your first name" required>

            <label for="lastName" class="register-label">Last Name:</label>
            <input type="text" id="lastName" v-model="lastName" class="register-input" placeholder="Enter your last name" required>

            <label for="bio" class="register-label">Bio:</label>
            <textarea id="bio" v-model="bio" class="register-input" placeholder="Write a short bio" required></textarea>

            <label for="dateOfBirth" class="register-label">Date of Birth:</label>
            <input type="date" id="dateOfBirth" v-model="dateOfBirth" class="register-input" required>

            <label for="email" class="register-label">Email:</label>
            <input type="email" id="email" v-model="email" class="register-input" placeholder="Enter your email" required>

            <label for="password" class="register-label">Password:</label>
            <input type="password" id="password" v-model="password" class="register-input" placeholder="Enter your password" required>
            
            <label for="accountType" class="register-label">Account Type:</label>
            <select id="accountType" v-model="isPrivate" class="register-input">
                <option :value="true">Public</option>
                <option :value="false">Private</option>
            </select>

            <a href="/login" class="login-link">Already have an account? Login here</a>
            <button type="submit" class="register-button">Register</button>
        </form>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </div>
</template>

<script>
import config from '@/config';
import axios from 'axios';

export default {
    data() {
        return {
            username: '',
            firstName: '',
            lastName: '',
            bio: '',
            dateOfBirth: '',
            email: '',
            password: '',
            isPrivate: false,
            errorMessage: '',
        };
    },
    methods: {
        async register() {
            const query = `
                mutation CreateUser($username: String!, $firstName: String!, $lastName: String!, $bio: String!, $dateOfBirth: String!, $email: String!, $password: String!, $isPrivate: Boolean!) {
                    createUser(username: $username, firstName: $firstName, lastName: $lastName, bio: $bio, dateOfBirth: $dateOfBirth, email: $email, password: $password, isPrivate: $isPrivate) {
                        token
                        error
                    }
                }
            `;

            const variables = {
                username: this.username,
                firstName: this.firstName,
                lastName: this.lastName,
                bio: this.bio,
                dateOfBirth: this.dateOfBirth,
                email: this.email,
                password: this.password,
                isPrivate: this.isPrivate,
            };

            try {
                const response = await axios.post(config.graphqlUrl, {
                    query,
                    variables,
                });

                const { data } = response.data;
                if (data.createUser.error) {
                    this.errorMessage = data.createUser.error;
                } else {
                    const token = data.createUser.token;
                    localStorage.setItem('authToken', token);
                    this.$router.push({ name: 'home' });
                }
            } catch (error) {
                this.errorMessage = 'An unexpected error occurred. Please try again.';
                console.error(error);
            }
        },
    },
};
</script>

<style scoped>
.register-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    width: 100%;
    font-family: Arial, sans-serif;
    overflow-y: auto;
}

.register-title {
    font-size: 2rem;
    color: #4682b4;
    margin-bottom: 1.5rem;
}

.register-form {
    width: 100%;
    max-width: 400px;
    display: flex;
    flex-direction: column;
    background-color: #000000;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border: 1px solid #87cefa;
}

.register-form a {
    font-size: 0.9rem;
    color: #6a5acd;
    margin-bottom: 1rem;
}

.register-label {
    font-size: 1rem;
    color: #4682b4;
    margin-bottom: 0.5rem;
}

.register-input {
    font-size: 1rem;
    padding: 0.75rem;
    margin-bottom: 1.5rem;
    border: 1px solid #535c68;
    border-radius: 4px;
    background-color: #000000;
    color: #fff;
    outline: none;
    transition: border-color 0.3s, box-shadow 0.3s;
}

.register-input:focus {
    border-color: #4682b4;
    box-shadow: 0 0 5px rgba(70, 130, 180, 0.5);
}

.register-button {
    font-size: 1rem;
    padding: 0.75rem;
    color: #fff;
    background-color: #4682b4;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s, transform 0.3s;
}

.register-button:hover {
    background-color: #4169e1;
    transform: scale(1.02);
}
</style>
