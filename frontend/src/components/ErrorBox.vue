<template>
    <div v-if="message" class="error-box">
      <div class="error-header">
        <p>Error</p>
        <button @click="closeError">✖</button>
      </div>
      <div class="error-body">
        <p>{{ message }}</p>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      message: {
        type: String,
        required: false,
        default: null,
      },
    },
    methods: {
      closeError() {
        this.$emit('close');
      },
    },
  };
  </script>
  
  <style scoped>
  .error-box {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 300px; /* Fixed width */
    height: 120px; /* Fixed height */
    background-color: #2a2a2a; /* Dark background */
    color: #ff6b6b; /* Bright error text */
    border: 1px solid #ff6b6b; /* Border matches text */
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 10px;
    box-sizing: border-box; /* Include padding in dimensions */
    animation: fadeIn 0.3s ease-in-out;
  }
  
  .error-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 18px;
    font-weight: bold;
    color: #ff6b6b; /* Highlight error text */
  }
  
  .error-body {
    flex-grow: 1;
    overflow: hidden; /* Prevent overflow of text */
    text-overflow: ellipsis;
    color: #ffffff; /* Lighter color for the message text */
    font-size: 14px;
  }
  
  button {
    background: none;
    border: none;
    font-size: 18px;
    color: #ff6b6b; /* Close button color */
    cursor: pointer;
    transition: color 0.2s;
  }
  
  button:hover {
    color: #ff4c4c; /* Lighter red on hover */
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  </style>
  