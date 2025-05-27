<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <!-- Podium/ranking steps -->
    <rect x="3" y="16" width="4" height="6" rx="1"></rect>
    <rect x="10" y="12" width="4" height="10" rx="1"></rect>
    <rect x="17" y="18" width="4" height="4" rx="1"></rect>

    <!-- Trophy/crown on top step -->
    <path d="M10 12V10a2 2 0 0 1 4 0v2"></path>
    <circle cx="12" cy="8" r="2"></circle>

    <!-- Position numbers -->
    <text x="5" y="14" font-size="3" text-anchor="middle" fill="currentColor">2</text>
    <text x="12" y="10" font-size="3" text-anchor="middle" fill="currentColor">1</text>
    <text x="19" y="16" font-size="3" text-anchor="middle" fill="currentColor">3</text>
  </svg>
</template>