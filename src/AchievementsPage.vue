<template>
  <div class="achievements-page">
    <div class="content">
      <div class="placeholder-content">
        <AchievementsIcon class="achievement-icon" />
        <h1>Awards</h1>
        <p class="description">
          Track your archery progress and unlock awards based on your performance.
        </p>
        <div class="coming-soon">
          <h2>Coming Soon</h2>
          <ul class="feature-list">
            <li>Score-based awards</li>
            <li>Consistency milestones</li>
            <li>Personal records tracking</li>
            <li>Classification progress</li>
            <li>Season awards</li>
          </ul>
        </div>
        <div class="note">
          <p>
            <strong>Note:</strong> Data management has moved to your 
            <router-link to="/you" class="profile-link">Profile</router-link> page.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import AchievementsIcon from '@/components/icons/AchievementsIcon.vue'
</script>

<style scoped>
.achievements-page {
  padding: 0.5rem;
  max-width: 800px;
  margin: 0 auto;
}

.content {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.placeholder-content {
  text-align: center;
  max-width: 500px;
  padding: 2rem;
}

.achievement-icon {
  width: 80px;
  height: 80px;
  margin-bottom: 1.5rem;
  color: var(--color-highlight);
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: var(--color-text);
}

.description {
  font-size: 1.1rem;
  color: var(--color-text-mute);
  margin-bottom: 2rem;
  line-height: 1.5;
}

.coming-soon {
  background-color: var(--color-background-soft);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.coming-soon h2 {
  font-size: 1.3rem;
  margin-bottom: 1rem;
  color: var(--color-text);
}

.feature-list {
  list-style: none;
  padding: 0;
}

.feature-list li {
  padding: 0.5rem 0;
  color: var(--color-text-light);
  border-bottom: 1px solid var(--color-border-light);
}

.feature-list li:last-child {
  border-bottom: none;
}

.feature-list li::before {
  content: "🏹";
  margin-right: 0.5rem;
}

.note {
  background-color: var(--color-background-mute);
  border-left: 4px solid var(--color-highlight);
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
}

.note p {
  margin: 0;
  color: var(--color-text);
}

.profile-link {
  color: var(--color-highlight);
  text-decoration: none;
  font-weight: 600;
}

.profile-link:hover {
  text-decoration: underline;
}
</style>