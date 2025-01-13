import { createApp } from 'vue'
import App from './App.vue'
import { createWebHistory,createRouter } from 'vue-router'
import Login from './components/Login.vue'
import Register from './components/Register.vue'
import User from './components/User.vue'
import Profile from './components/Profile.vue'
import Home from './components/Home.vue'
import Followers from './components/Followers.vue'
import Post from './components/Post.vue'
import Search from './components/Search.vue'
import './assets/base.css'

const routes = [
  { path: '/', component: Home,name: 'home' },
    { path: '/login', component: Login,name: 'login' },
    { path: '/register', component: Register,name: 'register' },
    { path: '/profile', component: Profile,name: 'profile' },
    { path: '/user/:username', component: User,name: 'user' },
    { path: '/post/:postId', component: Post,name: 'post' },
    { path: '/followers', component: Followers,name: 'followers' },
    { path: '/search', component: Search,name: 'search' },
  ]
  
  const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
  })

const app = createApp(App).use(router).mount('#app')


export default router