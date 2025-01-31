<template>
    <div class="bug-report-container">
        <h1>Report an Issue</h1>
        <form @submit.prevent="submitForm" class="bug-report-form">
            <div class="form-group">
                <label for="issue-type">Issue Type</label>
                <select v-model="formData.issueType" id="issue-type" required>
                    <option value="" disabled>Select issue type</option>
                    <option value="bug">Bug</option>
                    <option value="content">Content/Material</option>
                    <option value="other">Other</option>
                </select>
                <p v-if="formData.issueType === 'bug'" class="issue-description">
                    A bug is any error or malfunction you encountered on the page, such as broken links, incorrect
                    layouts, or missing content.
                </p>
                <p v-if="formData.issueType === 'content'" class="issue-description">
                    Content/Material issues refer to inappropriate content such as adult material, offensive language,
                    or anything that violates community standards.
                </p>
                <p v-if="formData.issueType === 'other'" class="issue-description">
                    Choose "Other" if your issue doesn't fit into the above categories. For example, suggestions or
                    feature requests.
                </p>
            </div>

            <div class="form-group">
                <label for="description">Description</label>
                <textarea v-model="formData.description" id="description" rows="5" required
                    :class="{ 'input-invalid': charCount < 100 || charCount > 3000 }"></textarea>
                <p class="character-counter" :class="{ 'error': charCount < 100 || charCount > 3000 }">
                    {{ charCount }} / 3000 characters (Min: 100)
                </p>
            </div>

            <button type="submit" :disabled="charCount < 100 || charCount > 3000">Submit Report</button>
        </form>

        <div v-if="responseMessage" :class="['response-message', responseType]">
            <p>{{ responseMessage }}</p>
        </div>
    </div>
</template>

<script>
import { getDataGraphQL } from '@/assets/dataProvider.js';
export default {
    data() {
        return {
            formData: {
                issueType: '',
                description: '',
                contactInfo: ''
            },
            responseMessage: ''
        };
    },
    computed: {
        charCount() {
            return this.formData.description.length;
        },
        responseType() {
            if (this.responseMessage.toLowerCase().includes('error')) {
                return 'error';
            }
            if (this.responseMessage.toLowerCase().includes('good')) {
                return 'success';
            }
            return 'success';
        }
    },
    methods: {
        async submitForm() {
            const description = btoa(this.formData.description);
            const payload = `
                mutation ReportIssue {
                    createReport(type: "${this.formData.issueType}", description: "${description}") {
                        success
                        error
                    }
                }
            `;

            const { error, response } = await getDataGraphQL(payload)

            if (!response.report.success) {
                this.responseMessage = "There was an error submitting your report. Please try again later.";
            }

            this.responseMessage = 'Your report has been submitted successfully!';
            this.formData.issueType = '';
            this.formData.description = '';
            this.formData.contactInfo = '';
        }
    }
};
</script>

<style scoped>
.bug-report-container {
    max-width: 600px;
    margin: 100px auto;
    padding: 20px;
    background-color: #121212;
    color: #f5f5f5;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.5);
}

h1 {
    color: #9c27b0;
    text-align: center;
    font-size: 2rem;
}

.bug-report-form {
    display: flex;
    flex-direction: column;
}

.form-group {
    margin-bottom: 20px;
}

label {
    font-weight: bold;
    color: #9c27b0;
}

textarea,
select,
input {
    width: 100%;
    padding: 10px;
    font-size: 16px;
    border: 1px solid #9c27b0;
    border-radius: 4px;
    background-color: #2e2e2e;
    color: #f5f5f5;
}

select,
textarea {
    background-color: #2e2e2e;
}

input {
    background-color: #333;
}

.character-counter {
    color: #b0b0b0;
    font-size: 14px;
    margin-top: 5px;
}

.character-counter.error {
    color: #ff6b6b;
}

button {
    padding: 10px 20px;
    background-color: #9c27b0;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.3s;
}

button:hover {
    background-color: #7b1fa2;
}

button:disabled {
    background-color: #7a4b9c;
    cursor: not-allowed;
}

.response-message {
    margin-top: 20px;
    padding: 10px;
    color: white;
    border-radius: 4px;
    text-align: center;
    transition: background-color 0.3s ease;
}


.response-message.error {
    background-color: #ff4d4d;
}

.response-message.success {
    background-color: #2e5530;
}
</style>