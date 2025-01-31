<template>
    <div class="liked-page">
        <h2>Your reports</h2>
        <div v-for="user in reports" :key="user.username" class="post-card">
            <div class="post-header">
                <h3><b class="report-highlighted">Type of report:</b> {{ user.type }}</h3>
                <p>{{ formatTime(user.date) }}</p>
            </div>
            <div class="post-details">
                <p>{{ user.description }}</p>
            </div>
            <span class="role">{{ user.status == 0? "Your report is pending to be reviewed" : "Your report is being reviewed." }}</span>
        </div>
    </div>
</template>
  
<script>
import config from '@/config';
import { getDataGraphQL } from '@/assets/dataProvider';
import { formatTime } from '@/assets/utils';

export default {
    data() {
        return {
            reports: [],
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
                    console.error('Error fetching reports:', error);
                });
        },
    },
};
</script>
  
<style scoped>
.liked-page {
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

.post-header {
    text-align: left;
}

.post-details {
    margin-top: 1rem;
    word-wrap: break-word;
}
.report-highlighted {
    color: #9c27b0;
}
</style>
  