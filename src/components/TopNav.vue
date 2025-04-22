<script>
import router from '@/router';
import authService from "@/authService";
import dbService from '@/dbService';

export default {
  data() {
    return {
      authState: authService.state,
      isOpen: false,
      user: null,
    };
  },
  methods: {
    toggleDropdown() {
      this.isOpen = !this.isOpen;
    },
    handleClickOutside(event) {
      const dropdown = this.$el.querySelector('.profile-menu');
      if (dropdown && !dropdown.contains(event.target)) {
        this.isOpen = false;
      }
    },
    routerLogin() {
      router.push('/login');
    },
    async routerLogout() {
      await authService.logoutUser();
      router.push('/login');
    }
  },
  computed: {
    isLoggedIn() {
      return this.authState.isLoggedIn;
    },
    user() {
      return this.authState.user;
    }
  },
  mounted() {
    window.addEventListener('click', this.handleClickOutside);
  },
  beforeUnmount() {
    window.removeEventListener('click', this.handleClickOutside);
  }
};
</script>

<template>
  <nav class="top-nav">
    <div class="nav-container">
      <div class="profile-menu">
        <button v-if="isLoggedIn" @click="toggleDropdown" class="profile-button">
          <img 
            class="avatar" 
            :src="user && user.avatar ? user.avatar : 'src/assets/planhumano.png'" 
            alt="User avatar"
          />
          <span class="username">{{ user ? user.displayName : 'Iniciar sesión' }}</span>
          <svg 
            class="dropdown-icon" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              stroke-width="2" 
              d="M19 9l-7 7-7-7"
            ></path>
          </svg>
        </button>
        <button v-else class="profile-button" @click="routerLogin">
          Iniciar sesión
        </button>

        <!-- Dropdown Menu -->
        <transition name="fade">
          <div 
            v-if="isOpen" 
            class="dropdown-menu"
          >
            <a href="#" class="dropdown-item">Profile</a>
            <a href="#" class="dropdown-item">Settings</a>
            <a @click="routerLogout" class="dropdown-item">Logout</a>
          </div>
        </transition>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.top-nav {
  background-color: var(--color-background-mute);
  opacity: 0.4;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 10;
  margin-top: 0;
}

.top-nav:hover {
  opacity: 1;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
  height: 24px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.profile-menu {
  position: relative;
}

.profile-button {
  display: flex;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text);
  font-size: 14px;
}

.avatar {
  height: 32px;
  width: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.username {
  margin-left: 8px;
}

.dropdown-icon {
  margin-left: 4px;
  width: 16px;
  height: 16px;
}

.dropdown-menu {
  position: absolute;
  left: 0;
  margin-top: 8px;
  width: 180px;
  background-color: var(--color-background-mute);
  border-radius: 4px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 20;
  animation: fadeIn 0.2s;
}

.dropdown-item {
  display: block;
  padding: 8px 16px;
  text-decoration: none;
  color: var(--color-text);
  font-size: 14px;
}

.dropdown-item:hover {
  background-color: #f7fafc;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
