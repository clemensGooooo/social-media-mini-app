<template>
    <div class="page">
        <h2>Your reports</h2>
        <p>See you reports to content violations, bug reports and other reports.</p>
        <div v-for="user in reports" :key="user.username" class="post-card">
            <div class="header">
                <b class="info_report">Type of report:</b>
                <h3> {{ report[user.type] }}</h3>
                <div class="divider"></div>
                <p>{{ formatTime(user.date) }}</p>
            </div>
            <div class="details">
                <p>Description</p>
                <p>{{ user.description }}</p>
            </div>
            <span class="status"><b>Status:</b> <span>{{ user.status == 0 ? "pending to be reviewed" : "being reviewed."
                    }}</span></span>
        </div>
        <ErrorBox :message="error" @close="clearError" />
    </div>
</template>

<script>
import { getDataGraphQL } from '@/assets/dataProvider';
import { formatTime } from '@/assets/utils';
import ErrorBox from '../components/ErrorBox.vue';

export default {
    data() {
        return {
            reports: [],
            report: {
                "content": "Content violation",
                "other": "Unique problem",
                "bug": " Bug report"
            },
            error: ""
        };
    },
    mounted() {
        this.fetchReports();
    },
    methods: {
        formatTime,
        fetchReports() {
            const query = `
                query GetReports {
                    getReports {
                        type
                        description
                        status
                        date
                    }
                }
            `;

            getDataGraphQL(query)
                .then(({ response }) => {
                    if (response.getReports) {
                        this.reports = response.getReports;
                    }
                })
                .catch((error) => {
                    this.error = "There was an error fetching the reports, please try reloading!"
                });
        },
        clearError() {
            this.error = ""
        }
    },
    components: {
        ErrorBox
    }
};
</script>

<style scoped>
.page {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin: 2rem auto;
    max-width: 600px;
    padding: 1rem;
    box-sizing: border-box;
}

.post-card {
    text-align: left;
    background-color: #131212;
    border: 1px solid #2e2c2c;
    border-radius: 8px;
    padding: 1.5rem;
    max-width: 600px;
    width: 100%;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.header {
    text-align: left;
}

.details {
    margin-top: 1rem;
    word-wrap: break-word;
}

.details p:nth-child(1) {
    font-size: medium;
    font-weight: bold;
}

.info_report {
    font-size: small;
    color: #838383;
}

.status span {
    color: #9c27b0;
}

.status b {
    font-weight: bold;
}

.divider {
    margin: 10px 0px 10px 0px;
    border-bottom: 1px solid grey;
}
</style>