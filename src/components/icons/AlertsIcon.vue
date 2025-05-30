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
    <!-- Bell shape -->
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />

    <!-- Bell bottom -->
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />

    <!-- Alert indicator (small circle) -->
    <circle cx="18" cy="6" r="3" fill="currentColor" />

    <!-- Optional: small lines to show ringing/vibration -->
    <path d="M20 4l1-1" stroke-width="1.5" opacity="0.7" />
    <path d="M20 8l1 1" stroke-width="1.5" opacity="0.7" />
    <path d="M16 4l-1-1" stroke-width="1.5" opacity="0.7" />
    <path d="M16 8l-1 1" stroke-width="1.5" opacity="0.7" />
  </svg>
</template>