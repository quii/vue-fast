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
    <!-- Door frame -->
    <rect x="14" y="2" width="8" height="20" rx="1" />

    <!-- Door handle -->
    <circle cx="17" cy="12" r="0.5" fill="currentColor" />

    <!-- Person figure -->
    <!-- Head -->
    <circle cx="6" cy="6" r="2" />

    <!-- Body -->
    <path d="M4 14v8" />
    <path d="M8 14v8" />
    <path d="M6 10v4" />

    <!-- Arms (one pointing toward door) -->
    <path d="M6 12l3 0" />
    <path d="M6 12l-2 -1" />

    <!-- Movement lines to show direction -->
    <path d="M10 8l2 0" stroke-dasharray="2,2" opacity="0.6" />
    <path d="M11 10l2 0" stroke-dasharray="2,2" opacity="0.6" />

    <!-- Arrow pointing toward door -->
    <path d="M12 12l2 0" />
    <path d="M13 11l1 1l-1 1" />
  </svg>
</template>