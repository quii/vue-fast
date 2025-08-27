<script setup>
import { useRoute } from "vue-router";
import { computed } from "vue";
import ScoreIcon from "@/components/icons/ScoreIcon.vue";
import HistoryIcon from "@/components/icons/HistoryIcon.vue";
import DiaryIcon from "@/components/icons/DiaryIcon.vue";
import SightIcon from "@/components/icons/SightIcon.vue";
import AchievementsIcon from "@/components/icons/AchievementsIcon.vue";
import ProfileIcon from "@/components/icons/ProfileIcon.vue";
import LiveIcon from "@/components/icons/LiveIcon.vue";
import { useAchievementStore } from "@/stores/achievements.js";

const route = useRoute();
const achievementStore = useAchievementStore();

// Helper to determine if a route is active
const isActive = (path) => {
  return route.path === path;
};

// Show notification badge when there are unread achievements
const showNotificationBadge = computed(() => {
  return achievementStore.hasUnreadAchievements && !isActive('/achievements');
});
</script>

<template>
  <nav class="bottom-nav">
    <router-link to="/" class="nav-item" :class="{ active: isActive('/') }">
      <div class="icon-container">
        <ScoreIcon class="nav-icon" />
      </div>
      <span class="nav-label">Score</span>
    </router-link>

    <router-link to="/leaderboard" class="nav-item" :class="{ active: isActive('/leaderboard') }">
      <div class="icon-container">
        <LiveIcon class="nav-icon" />
      </div>
      <span class="nav-label">Live</span>
    </router-link>

    <router-link to="/history" class="nav-item"
                 :class="{ active: isActive('/history') || route.path.startsWith('/history/') }">
      <div class="icon-container">
        <HistoryIcon class="nav-icon" />
      </div>
      <span class="nav-label">History</span>
    </router-link>

    <router-link to="/diary" class="nav-item" :class="{ active: isActive('/diary') }">
      <div class="icon-container">
        <DiaryIcon class="nav-icon" />
      </div>
      <span class="nav-label">Diary</span>
    </router-link>

    <router-link to="/sight-marks" class="nav-item" :class="{ active: isActive('/sight-marks') }">
      <div class="icon-container">
        <SightIcon class="nav-icon" />
      </div>
      <span class="nav-label">Sight</span>
    </router-link>


    <router-link to="/you" class="nav-item" :class="{ active: isActive('/you') }">
      <div class="icon-container">
        <ProfileIcon class="nav-icon" />
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
  padding: 0.85em 0;
  width: calc(100% / 7); /* Updated to accommodate 7 items */
  color: var(--color-text-light);
  text-decoration: none;
  transition: color 0.2s ease;
  height: 100%;
}

.nav-item.active {
  color: var(--color-highlight, #4CAF50);
}

.icon-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 28px;
  margin-bottom: 0.3em;
}

.nav-icon {
  width: 28px;
  height: 28px;
}

.nav-label {
  font-size: 0.8em;
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
