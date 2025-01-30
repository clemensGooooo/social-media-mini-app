<template>
    <footer class="footer">
      <nav class="footer-nav">
        <router-link to="/about" class="footer-link">About</router-link>
        <router-link to="/report" class="footer-link">Report Issue</router-link>
        <span class="footer-text">Mistakes Can Happen</span>
        <span class="footer-text">&copy; {{ new Date().getFullYear() }} Purple</span>
      </nav>
    </footer>
  </template>
  
  <script>
  export default {
    name: "FooterComponent",
  };
  </script>
  
  <style scoped>
  .footer {
    background-color: #222;
    color: #fff;
    padding: 15px 0;
    text-align: center;
    position: relative;
    width: 100%;
    margin-top: auto;
  }
  .footer-nav {
    display: flex;
    justify-content: center;
    gap: 20px;
    flex-wrap: wrap;
  }
  .footer-link {
    color: #1e90ff;
    text-decoration: none;
    transition: color 0.3s;
  }
  .footer-link:hover {
    color: #ffcc00;
  }
  .footer-text {
    color: #aaa;
  }
  </style>