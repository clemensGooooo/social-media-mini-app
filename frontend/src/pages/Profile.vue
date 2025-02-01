<template>
    <div class="profile-page">
        <h2>Your Profile</h2>
        <div class="profile-card">
            <div class="profile-header">
                <label for="profileImage" class="profile-image-label">
                    <img :src="image" alt="Profile Picture" class="profile-picture" title="Upload profile image" />
                </label>
                <input 
                    type="file" 
                    id="profileImage" 
                    @change="handleImageUpload" 
                    accept="image/*" 
                    class="image-upload-input hidden"
                />
                <h2>{{ user.firstName }} {{ user.lastName }}</h2>
                <p class="role">{{ user.role == "user_public"? "You are a public user!": "You are a private user!" }}</p>
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
import { getDataGraphQL } from '@/assets/dataProvider';

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
                bio: ''
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
        async handleImageUpload(event) {
            const file = event.target.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append("file", file);

            try {
                const response = await axios.post("http://localhost:4000/file/profileUpload", formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${localStorage.getItem('authToken')}`,

                    }
                });

                if (response.data && response.data.url) {
                    this.image = response.data.url;
                    this.success = "Image uploaded successfully!";
                }
            } catch (error) {
                this.error = "Failed to upload image.";
            }
        },
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
            const { response, error } = await getDataGraphQL(query)
            if (error) this.error = error;

            this.user = response.getUser;
            if (response.getUser.profilePicture != "none")
            this.image = response.getUser.profilePicture;
            this.initializeFormData();
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
    flex-direction: column;
    gap: 1.5rem;
    margin: 2rem auto;
    max-width: 600px;
    padding: 5px;
    box-sizing: border-box;
}

.image-upload-input.hidden {
    display: none;
}

.image-upload-input {
    margin-top: 20px;
    display: block;
    width: 50%;
    text-align: center;
}

/* Centering the profile page */
.liked-page {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin: 2rem auto;
    max-width: 600px;
    padding: 1rem;
    padding-top: 2rem;
    box-sizing: border-box;
}

/* Styling for profile card similar to settings card */
.profile-card {
    background-color: #131212;
    border: 1px solid #2e2c2c;
    border-radius: 8px;
    padding: 1.5rem;
    max-width: 600px;
    width: 100%;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

/* Centering header text */
.profile-header {
    text-align: center;
}

/* Profile picture with cursor pointer */
.profile-picture {
    border-radius: 50%;
    width: 100px;
    height: 100px;
    margin-bottom: 10px;
    cursor: pointer;
}

/* Role text styling */
.role {
    color: #8a2be2;
    font-size: 14px;
}

/* Profile body spacing */
.profile-body {
    margin-top: 20px;
}

/* Styling for input fields */
.form-group {
    margin-bottom: 15px;
    display: flex;
    flex-direction: column;
}

/* Label styles */
label {
    display: block;
    margin-bottom: 5px;
    color: #8a2be2;
    font-weight: 500;
}

/* Input and textarea styles */
input,
textarea {
    width: 100%;
    padding: 8px;
    border: 1px solid #2e2c2c;
    border-radius: 4px;
    font-size: 14px;
    background-color: #1a1818;
    color: #f8f8fb;
}

/* Button styling */
.update-button {
    background-color: #8a2be2;
    color: white;
    padding: 10px 15px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    width: 100%;
    font-size: 16px;
    transition: background 0.3s ease;
}

.update-button:hover {
    background-color: #6a0dad;
}

/* Message styles */
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
  