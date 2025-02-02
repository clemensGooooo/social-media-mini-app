<template>
    <div class="container">
      <div class="content">
        <h1>Service Unavailable</h1>
        <p>We're currently experiencing technical difficulties. Please try again later.</p>
        <button @click="reloadPage">Retry</button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    methods: {
      reloadPage() {
        this.$router.push({ name: 'home' });
        setTimeout(() => {
          window.location.reload();
        },200)
      }
    }
  };
  </script>
  
  <style scoped>
  .container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #121212;
    color: #ffffff;
    text-align: center;
    margin: 10px;
  }
  
  .content {
    padding: 2rem;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.1);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(10px);
  }
  
  h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }
  
  p {
    font-size: 1.2rem;
    margin-bottom: 1.5rem;
  }
  
  button {
    padding: 0.75rem 1.5rem;
    background-color: #9c27b0;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
    transition: background 0.3s ease;
  }
  
  button:hover {
    background-color: #0056b3;
  }
  </style>