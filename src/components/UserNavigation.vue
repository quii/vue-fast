<script setup>
import { computed } from "vue";
import { useUserStore } from "@/stores/user";
import { useRoute } from "vue-router";

const user = useUserStore();
const route = useRoute();

const needsBackup = computed(() => user.needsBackup());

// Helper to determine if a route is active
const isActive = (path) => {
  return route.path === path;
};
</script>

<template>
  <nav class="bottom-nav">
    <router-link to="/" class="nav-item" :class="{ active: isActive('/') }">
      <div class="icon-container">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round" class="nav-icon">
          <circle cx="12" cy="12" r="10"></circle>
          <circle cx="12" cy="12" r="6"></circle>
          <circle cx="12" cy="12" r="2"></circle>
        </svg>
      </div>
      <span class="nav-label">Score</span>
    </router-link>

    <router-link to="/history" class="nav-item"
                 :class="{ active: isActive('/history') || route.path.startsWith('/history/') }">
      <div class="icon-container">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round" class="nav-icon">
          <path d="M12 8v4l3 3"></path>
          <path d="M3.05 11a9 9 0 1 1 .5 4"></path>
          <path d="M2 2v5h5"></path>
        </svg>
      </div>
      <span class="nav-label">History</span>
    </router-link>

    <router-link to="/diary" class="nav-item" :class="{ active: isActive('/diary') }">
      <div class="icon-container">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round" class="nav-icon">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
        </svg>
      </div>
      <span class="nav-label">Diary</span>
    </router-link>

    <router-link to="/sight-marks" class="nav-item" :class="{ active: isActive('/sight-marks') }">
      <div class="icon-container">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round" class="nav-icon">
          <path d="M2 12h20"></path>
          <path d="M12 2v20"></path>
          <circle cx="12" cy="12" r="4"></circle>
        </svg>
      </div>
      <span class="nav-label">Sight</span>
    </router-link>

    <router-link to="/data" class="nav-item" :class="{ active: isActive('/data') }">
      <div class="icon-container">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round" class="nav-icon">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        <span v-if="needsBackup" class="notification-badge"></span>
      </div>
      <span class="nav-label">Data</span>
    </router-link>

    <router-link to="/you" class="nav-item" :class="{ active: isActive('/you') }">
      <div class="icon-container">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round" class="nav-icon">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      </div>
      <span class="nav-label">Profile</span>
    </router-link>
  </nav>
</template>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  background-color: var(--color-background);
  box-shadow: 0 -1px 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
  padding-bottom: env(safe-area-inset-bottom, 0);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.75em 0;
  width: 20%;
  color: var(--color-text-light);
  text-decoration: none;
  transition: color 0.2s ease;
  height: 100%; /* Ensure all items have the same height */
}

.nav-item.active {
  color: var(--color-highlight, #4CAF50);
}

.icon-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 24px; /* Fixed height for all icon containers */
  margin-bottom: 0.25em;
}

.nav-icon {
  width: 24px;
  height: 24px;
}

.nav-label {
  font-size: 0.75em;
  font-weight: 500;
}

.notification-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #dc3545;
}

/* Add safe area padding for iOS devices */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .bottom-nav {
    padding-bottom: env(safe-area-inset-bottom);
  }
}
</style>
