import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";

export const useThemeStore = defineStore("theme", () => {
  // Define theme preferences with useLocalStorage
  const state = useLocalStorage("theme-preference", {
    // Theme options: 'device', 'light', 'dark'
    mode: "device"
  });

  // Function to apply theme to document
  function applyTheme() {
    if (state.value.mode === "device") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", state.value.mode);
    }
  }

  // Set theme
  function setTheme(newTheme: string) {
    if (["device", "light", "dark"].includes(newTheme)) {
      state.value.mode = newTheme;
      applyTheme();
    }
  }

  // Apply theme on initial load
  applyTheme();

  return {
    preferences: state,
    setTheme,
    applyTheme
  };
});