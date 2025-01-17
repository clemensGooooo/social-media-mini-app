<template>
  <div class="login-container">
    <h1 class="login-title">Login</h1>
    <form @submit.prevent="login" class="login-form">
      <label for="identifier" class="login-label">Username or Email:</label>
      <input type="text" id="identifier" v-model="identifier" class="login-input"
        placeholder="Enter your username or email" required>
      <label for="password" class="login-label">Password:</label>
      <input type="password" id="password" v-model="password" class="login-input" placeholder="Enter your password"
        required>
      <a href="/register" class="register-link">Don't have an account? Register here</a>
      <br>
      <button type="submit" class="login-button">Login</button>
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
      identifier: '',
      password: '',
      errorMessage: '',
    };
  },
  methods: {
    isEmail(identifier) {
      // Simple regex to check for email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(identifier);
    },
    async login() {
      const isEmail = this.isEmail(this.identifier);

      const query = `
        mutation Login($username: String, $email: String, $password: String!) {
          login(username: $username, email: $email, password: $password) {
            token
            error
          }
        }
      `;

      const variables = {
        username: isEmail ? null : this.identifier,
        email: isEmail ? this.identifier : null,
        password: this.password,
      };

      try {
        const response = await axios.post(config.graphqlUrl, {
          query,
          variables,
        });

        const { data } = response.data;
        if (data.login.error) {
          this.errorMessage = data.login.error;
        } else {

          const token = data.login.token;

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
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 90vh;
  width: 100%;
  font-family: Arial, sans-serif;
}

.login-title {
  font-size: 2rem;
  color: #d4d4d4; /* Darker purple for the title */
  margin-bottom: 1.5rem;
}

.login-form {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  background-color: #000000;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid #8413a0; /* Light purple border for the form */
}

.login-form a {
  font-size: 0.9rem;
  color: #6a5acd; /* Muted purple for links */
  margin-bottom: 1rem;
}

.login-label {
  font-size: 1rem;
  color: #6a5acd; /* Muted purple for labels */
  margin-bottom: 0.5rem;
}

.login-input {
  font-size: 1rem;
  padding: 0.75rem;
  margin-bottom: 1.5rem;
  background-color: #36323f;
  color: white;
  border: 1px solid #36323f; /* Subtle purple border */
  border-radius: 4px;
  outline: none;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.login-input:focus {
  border-color: #7b68ee; /* Slightly brighter purple on focus */
  box-shadow: 0 0 5px rgba(123, 104, 238, 0.5); /* Glowing purple effect */
}

.login-button {
  font-size: 1rem;
  padding: 0.75rem;
  color: #fff;
  background-color: #6a5acd; /* Purple button */
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.3s;
}

.login-button:hover {
  background-color: #5b4cca; /* Slightly darker purple on hover */
  transform: scale(1.02); /* Subtle scale effect */
}

</style>
