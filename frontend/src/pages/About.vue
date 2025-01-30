<template>
    <div class="about-page">
      <header class="about-header">
        <h1>About Our Social Media App</h1>
        <p>Connecting people, sharing moments, and building communities.</p>
      </header>
  
      <section class="app-introduction">
        <h2>What is Our App?</h2>
        <p>
          Our app is a social platform where users can share updates, connect with friends, 
          and interact with others through posts, comments, and likes. We believe in 
          fostering meaningful connections and keeping you up-to-date with the world around you.
        </p>
      </section>
  
      <section class="features">
        <h2>Features</h2>
        <ul>
          <li><strong>News Feed:</strong> Stay updated with the latest posts from your friends and community.</li>
          <li><strong>Messaging (Currently not available):</strong> Directly communicate with friends and family via private messages.</li>
        </ul>
      </section>
  
      <section class="mission">
        <h2>Our Mission</h2>
        <p>
          We aim to make connecting with others simple and fun. Whether you want to catch up with friends, 
          discover new communities, or simply share your day, we are here to help you stay connected.
        </p>
      </section>
      <br>
      <section class="svg-image">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 300" width="100%" height="auto">
        <!-- Background Rectangle -->
        <rect width="600" height="300" fill="#2d3748" />
        
        <!-- Text "SOCIAL MEDIA" -->
        <text x="50%" y="50%" font-size="80" text-anchor="middle" fill="#fff" dy=".3em">
          SOCIAL MEDIA
        </text>
      </svg>
    </section>
  
    </div>
  </template>
  
  <script>
  export default {
    name: "AboutPage",
  };
  </script>
  
  <style scoped>
  .about-page {
    font-family: Arial, sans-serif;
    margin: 0 auto;
    padding: 20px;
    max-width: 1200px;
  }
  
  .about-header {
    text-align: center;
    margin-bottom: 30px;
  }
  
  .about-header h1 {
    color: #c41bbb;
    font-size: 36px;
  }
  
  .about-header p {
    color: #8c2dcc;
    font-size: 18px;
  }
  
  .section {
    margin-bottom: 30px;
  }
  
  .features ul {
    list-style-type: none;
    padding: 0;
  }
  
  .features li {
    font-size: 18px;
    margin: 10px 0;
  }
  
  .features strong {
    color: #8c2dcc;
  }
  
  .mission {
    background-color: #222527;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .about-footer {
    text-align: center;
    margin-top: 50px;
    font-size: 14px;
    color: #4a5568;
  }
  </style>
  