<template>
    <div class="profile-page">
        <div class="profile-card">
            <div class="profile-header">
                <img :src="user.profilePicture =='null'? profilePicture:  image" alt="Profile Picture" class="profile-picture" />
                <h2>{{ user.firstName }} {{ user.lastName }}</h2>
                <p class="role">{{ user.role }}</p>
                <div v-if="user.bio" class="bio">
                    <p>{{ user.bio }}</p>
                </div>

            </div>

            <div class="profile-body">
                <form @submit.prevent="handleSubmit">
                    <div class="form-group">
                        <label for="username">Username</label>
                        <input type="text" id="username" v-model="formData.username" placeholder="Username" />
                    </div>

                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" v-model="formData.email" placeholder="Email" />
                    </div>

                    <div class="form-group">
                        <label for="password">New Password</label>
                        <input type="password" id="password" v-model="formData.password" placeholder="New Password" />
                    </div>

                    <div class="form-group">
                        <label for="lastPassword">Current Password</label>
                        <input type="password" id="lastPassword" v-model="formData.lastPassword"
                            placeholder="Current Password" />
                    </div>

                    <div class="form-group">
                        <label for="lastName">Last Name</label>
                        <input type="text" id="lastName" v-model="formData.lastName" placeholder="Last Name" />
                    </div>
                    <div class="form-group">
                        <label for="firstName">First Name</label>
                        <input type="text" id="firstName" v-model="formData.firstName" placeholder="First Name" />
                    </div>
                    <div class="form-group">
                        <label for="dob">Date of Birth</label>
                        <input disabled type="date" id="dob" v-model="formData.dateOfBirth" />
                    </div>

                    <div class="form-group">
                        <label for="bio">Bio</label>
                        <textarea id="bio" v-model="formData.bio" placeholder="Tell us about yourself"></textarea>
                    </div>

                    <div class="form-group">
                        <button type="submit" class="update-button">Update Profile</button>
                    </div>
                </form>
            </div>

            <div v-if="error" class="error-message">{{ error }}</div>
            <div v-else-if="success" class="success-message">{{ success }}</div>
        </div>
    </div>
</template>
  
<script>
import axios from 'axios';
import image from "../assets/profile.png"
import config from '@/config';

export default {
    data() {
        return {
            user: {},
            formData: {
                username: '',
                email: '',
                password: '',
                lastPassword: '',
                lastName: '',
                dateOfBirth: '',
                firstName: '',
                bio: '',
            },
            image: image,
            error: null,
            success: null,
        };
    },
    async created() {
        await this.fetchUser();
    },
    methods: {
        async fetchUser() {
            const query = `
          query {
            getUser {
              firstName
              lastName
              email
              role
              dateOfBirth
              username
              profilePicture
              bio
              error
            }
          }
        `;
            try {
                const response = await axios.post(config.graphqlUrl, {
                    query
                }, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                    }
                });
                const { data } = response.data;
                if (data.getUser.error) {
                    this.error = data.getUser.error;
                }
                else {
                    this.user = data.getUser;
                    this.initializeFormData();
                }
            }
            catch (err) {
                this.error = 'Failed to fetch user data.';
            }
        },
        initializeFormData() {
            this.formData = {
                username: this.user.username || null,
                email: this.user.email || null,
                lastName: this.user.lastName || null,
                password: null,
                lastPassword: null,
                dateOfBirth: this.user.dateOfBirth || null,
                firstName: this.user.firstName || null,
                bio: this.user.bio || null,
            };
        },
        async handleSubmit() {
            const updatedFields = {};
            Object.keys(this.formData).forEach((key) => {
                if (this.formData[key] && this.formData[key] !== this.user[key]) {
                    updatedFields[key] = this.formData[key];
                }
            });
            if (updatedFields.lastPassword && !updatedFields.lastPassword) {
                this.error = 'Current password is required for updates.';
                return;
            }
            if (Object.keys(updatedFields).length === 0) {
                this.error = 'No changes detected.';
                return;
            }
            const mutation = `
          mutation UpdateUser {
            updateUser(${Object.keys(updatedFields).map((key) => `${key}: "${updatedFields[key]}"`).join(', ')}) {
              success
              error
            }
          }
        `;
            try {
                const response = await axios.post(config.graphqlUrl, {
                    query: mutation,
                    variables: { input: updatedFields },
                }, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                    }
                });
                const { data } = response.data;
                if (data.updateUser.error) {
                    this.error = data.updateUser.error;
                }
                else if (data.updateUser.success) {
                    this.error = null;
                    this.success = "Updated profile successfully.";
                    await this.fetchUser();
                }
            }
            catch (err) {
                this.error = 'Failed to update user data.';
            }
        },
    },
};
</script>
  
<style scoped>
.profile-page {
    display: flex;
    justify-content: center;
    align-items: center;
    padding-top: 50px;
}

.profile-card {
    background-color: #000000;
    border: 2px solid #8a2be2;
    border-radius: 12px;
    padding: 20px;
    max-width: 700px;
    width: 100%;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
}

.profile-header {
    text-align: center;
}

.profile-picture {
    border-radius: 50%;
    width: 100px;
    height: 100px;
    margin-bottom: 10px;
}

.role {
    color: #6a0dad;
    font-size: 14px;
}

.profile-body {
    margin-top: 20px;
}

.form-group {
    margin-bottom: 15px;
    display: flex;
    flex-direction: column;
    margin-right: 20px;
}

label {
    display: block;
    margin-bottom: 5px;
    color: #4b0082;
}

input, textarea {
    width: 100%;
    padding: 8px;
    border: 1px solid #2b2a33;
    border-radius: 4px;
    font-size: 14px;
    background-color: #2b2a33;
    color: #f8f8fb;
}
.update-button {
    background-color: #8a2be2;
    color: white;
    padding: 10px 15px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    width: 100%;
    font-size: 16px;

}

.update-button:hover {
    background-color: #6a0dad;
}

.error-message {
    color: red;
    margin-top: 10px;
    text-align: center;
}

.success-message {
    color: rgb(9, 255, 62);
    margin-top: 10px;
    text-align: center;
}
</style>
  