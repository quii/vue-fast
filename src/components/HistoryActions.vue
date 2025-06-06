<script setup>
import BaseTopBar from "@/components/ui/BaseTopBar.vue";
import GraphIcon from "@/components/icons/GraphIcon.vue";
import { computed, h } from "vue";

const props = defineProps({
  showRoundGraph: Boolean,
  showIndoorHandicapGraph: Boolean,
  showOutdoorHandicapGraph: Boolean,
  showArrowsGraph: Boolean,
  roundName: String
});

const emit = defineEmits([
  "addManualScore",
  "openRoundGraph",
  "openIndoorHandicapGraph",
  "openOutdoorHandicapGraph",
  "openArrowsGraph"
]);

// Define the action buttons for the BaseTopBar
const actionButtons = computed(() => {
  const buttons = [];

  // Add Manual Score button (always visible)
  buttons.push({
    iconComponent: {
      render() {
        return h('svg', {
          xmlns: 'http://www.w3.org/2000/svg',
          width: '20',
          height: '20',
          viewBox: '0 0 24 24',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '2',
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round'
        }, [
          h('line', { x1: '12', y1: '5', x2: '12', y2: '19' }),
          h('line', { x1: '5', y1: '12', x2: '19', y2: '12' })
        ]);
      }
    },
    label: "Add Score",
    action: "add-manual-score",
    active: false,
    disabled: false,
    class: "wide-button"
  });

  // Round-specific graph button
  if (props.showRoundGraph) {
    buttons.push({
      iconComponent: GraphIcon,
      label: props.roundName || "Round",
      action: "open-round-graph",
      active: false,
      disabled: false,
      class: "wide-button"
    });
  }

  // Indoor handicap graph button
  if (props.showIndoorHandicapGraph) {
    buttons.push({
      iconComponent: GraphIcon,
      label: "Indoor HC",
      action: "open-indoor-handicap-graph",
      active: false,
      disabled: false,
      class: "wide-button"
    });
  }

  // Outdoor handicap graph button
  if (props.showOutdoorHandicapGraph) {
    buttons.push({
      iconComponent: GraphIcon,
      label: "Outdoor HC",
      action: "open-outdoor-handicap-graph",
      active: false,
      disabled: false,
      class: "wide-button"
    });
  }

  // Arrows graph button
  if (props.showArrowsGraph) {
    buttons.push({
      iconComponent: GraphIcon,
      label: "Arrows",
      action: "open-arrows-graph",
      active: false,
      disabled: false,
      class: "wide-button"
    });
  }

  return buttons;
});

// Handle actions from the BaseTopBar
function handleAction({ action }) {
  switch (action) {
    case "add-manual-score":
      emit("addManualScore");
      break;
    case "open-round-graph":
      emit("openRoundGraph");
      break;
    case "open-indoor-handicap-graph":
      emit("openIndoorHandicapGraph");
      break;
    case "open-outdoor-handicap-graph":
      emit("openOutdoorHandicapGraph");
      break;
    case "open-arrows-graph":
      emit("openArrowsGraph");
      break;
  }
}
</script>

<template>
  <BaseTopBar
    :actionButtons="actionButtons"
    :alignment="'spread'"
    @action="handleAction"
  />
</template>