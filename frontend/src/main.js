import { createApp } from 'vue'
import App from './App.vue'
import { createWebHistory,createRouter } from 'vue-router'
import Login from './pages/Login.vue'
import Register from './pages/Register.vue'
import User from './pages/User.vue'
import Profile from './pages/Profile.vue'
import Home from './pages/Home.vue'
import Followers from './pages/Followers.vue'
import Post from './pages/Post.vue'
import Search from './pages/Search.vue'
import About from './pages/About.vue'
import NotFound from './pages/NotFound.vue'
import Report from './pages/Report.vue'
import Settings from './pages/Settings.vue'
import Reports from './pages/Reports.vue'
import Liked from './pages/Liked.vue'
import NetworkFetchError from './pages/NetworkFetchError.vue'

import './assets/base.css'

const routes = [
  { path: '/', component: Home,name: 'home' },
    { path: '/login', component: Login,name: 'login' },
    { path: '/about', component: About,name: 'about' },
    { path: '/register', component: Register,name: 'register' },
    { path: '/profile', component: Profile,name: 'profile' },
    { path: '/user/:username', component: User,name: 'user' },
    { path: '/post/:postId', component: Post,name: 'post' },
    { path: '/followers', component: Followers,name: 'followers' },
    { path: '/search', component: Search,name: 'search' },
    { path: '/report', component: Report,name: 'report' },
    { path: '/settings', component: Settings,name: 'settings' },
    { path: '/reports', component: Reports,name: 'reports' },
    { path: '/liked', component: Liked,name: 'liked' },
    { path: '/networkFetchError', component: NetworkFetchError,name: 'networkFetchError' },    
    {path: '/:pathMatch(.*)*', component: NotFound,name: 'notfound' },
  ]
  
  const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
  })

const app = createApp(App).use(router).mount('#app')


export default router