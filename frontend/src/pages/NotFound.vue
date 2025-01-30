<template>
    <div class="error-page">
      <div class="error-container">
        <h1 class="error-code">404</h1>
        <p class="error-message">Oops! The page you're looking for doesn't exist.</p>
        <p class="suggestion">Maybe it was moved or deleted? Or you just got lost!</p>
        <router-link to="/" class="back-home">Go Back Home</router-link>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "ErrorPage",
  };
  </script>
  
  <style scoped>
  .error-page {
    background-color: #121212;
    color: #fff;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    text-align: center;
    font-family: 'Arial', sans-serif;
  }
  
  .error-container {
    padding: 20px;
    border-radius: 8px;
    background-color: #1f1f1f;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.7);
  }
  
  .error-code {
    font-size: 100px;
    font-weight: bold;
    color: #ff6347; /* Tomato red */
  }
  
  .error-message {
    font-size: 24px;
    margin: 20px 0;
  }
  
  .suggestion {
    font-size: 18px;
    color: #bbb;
  }
  
  .back-home {
    display: inline-block;
    padding: 10px 20px;
    margin-top: 20px;
    font-size: 16px;
    text-decoration: none;
    color: #fff;
    background-color: #ff6347;
    border-radius: 5px;
    transition: background-color 0.3s;
  }
  
  .back-home:hover {
    background-color: #ff4500;
  }
  </style>
  