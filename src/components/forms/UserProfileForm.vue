<script setup>
import { ref, computed, watchEffect } from 'vue'
import SectionCard from '@/components/ui/SectionCard.vue'
import FormGroup from '@/components/ui/FormGroup.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import ButtonGroup from '@/components/ui/ButtonGroup.vue'
import { classificationList } from '@/domain/scoring/classificationList.js'

const props = defineProps({
  title: {
    type: String,
    default: 'Complete Your Profile'
  },
  description: {
    type: String,
    default: 'Please provide the following information:'
  },
  showName: {
    type: Boolean,
    default: true
  },
  nameLabel: {
    type: String,
    default: 'Your Name'
  },
  namePlaceholder: {
    type: String,
    default: 'Enter your full name (e.g. John Smith)'
  },
  nameRequired: {
    type: Boolean,
    default: true
  },
  showClassifications: {
    type: Boolean,
    default: true
  },
  submitText: {
    type: String,
    default: 'Save Profile'
  },
  showCancel: {
    type: Boolean,
    default: false
  },
  cancelText: {
    type: String,
    default: 'Cancel'
  },
  // Initial values
  initialName: {
    type: String,
    default: ''
  },
  initialAgeGroup: {
    type: String,
    default: ''
  },
  initialGender: {
    type: String,
    default: ''
  },
  initialBowType: {
    type: String,
    default: ''
  },
  initialIndoorClassifications: {
    type: Object,
    default: () => ({})
  },
  initialOutdoorClassifications: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['submit', 'cancel'])

// Form state
const name = ref(props.initialName)
const selectedAgeGroup = ref(props.initialAgeGroup)
const selectedGender = ref(props.initialGender)
const selectedBowType = ref(props.initialBowType)
const indoorClassifications = ref({ ...props.initialIndoorClassifications })
const outdoorClassifications = ref({ ...props.initialOutdoorClassifications })
const nameError = ref('')

// Validation
function validateName(nameValue) {
  const trimmedName = nameValue.trim()

  if (props.nameRequired && trimmedName.length === 0) {
    return 'Please enter your name'
  }

  if (trimmedName.length > 0 && trimmedName.length < 2) {
    return 'Name must be at least 2 characters long'
  }

  // Check if it's a 4-digit number (likely a join code)
  if (/^\d{4}$/.test(trimmedName)) {
    return 'Please enter your name, not a join code'
  }

  return null
}

const isValid = computed(() => {
  // Name validation
  if (props.showName && props.nameRequired && name.value.trim().length === 0) {
    return false
  }

  if (props.showName && validateName(name.value)) {
    return false
  }

  // Required profile fields
  return selectedAgeGroup.value &&
         selectedGender.value &&
         selectedBowType.value &&
         (props.showClassifications ? outdoorClassifications.value[selectedBowType.value] : true)
})

// Methods
function handleNameInput() {
  nameError.value = ''
}

function updateIndoorClassification(bowType, classification) {
  indoorClassifications.value = {
    ...indoorClassifications.value,
    [bowType]: classification
  }
}

function updateOutdoorClassification(bowType, classification) {
  outdoorClassifications.value = {
    ...outdoorClassifications.value,
    [bowType]: classification
  }
}

function handleSubmit() {
  if (props.showName) {
    const error = validateName(name.value)
    if (error) {
      nameError.value = error
      return
    }
  }

  if (!isValid.value) return

  emit('submit', {
    name: name.value.trim(),
    ageGroup: selectedAgeGroup.value,
    gender: selectedGender.value,
    bowType: selectedBowType.value,
    indoorClassifications: indoorClassifications.value,
    outdoorClassifications: outdoorClassifications.value
  })
}

function handleCancel() {
  emit('cancel')
}

// Initialize classifications when bow type changes
watchEffect(() => {
  if (selectedBowType.value && !indoorClassifications.value[selectedBowType.value]) {
    indoorClassifications.value = {
      ...indoorClassifications.value,
      [selectedBowType.value]: "Unclassified"
    }
  }

  if (selectedBowType.value && !outdoorClassifications.value[selectedBowType.value]) {
    outdoorClassifications.value = {
      ...outdoorClassifications.value,
      [selectedBowType.value]: "Unclassified"
    }
  }
})
</script>

<template>
  <SectionCard :title="title">
    <p class="profile-intro">{{ description }}</p>

    <FormGroup v-if="showName" :label="nameLabel">
      <BaseInput
        v-model="name"
        type="text"
        :placeholder="namePlaceholder"
        :class="{ 'error': nameError }"
        @input="handleNameInput"
      />
      <div v-if="nameError" class="error-message">
        {{ nameError }}
      </div>
      <div v-if="nameLabel.includes('display')" class="help-text">
        This is your display name that other archers will see
      </div>
    </FormGroup>

    <FormGroup label="Age Group">
      <BaseSelect v-model="selectedAgeGroup">
        <option disabled value="">Select age group</option>
        <option>50+</option>
        <option value="senior">Senior</option>
        <option value="u21">Under 21</option>
        <option value="u18">Under 18</option>
        <option value="u16">Under 16</option>
        <option value="u15">Under 15</option>
        <option value="u14">Under 14</option>
        <option value="u12">Under 12</option>
      </BaseSelect>
    </FormGroup>

    <FormGroup label="Gender">
      <BaseSelect v-model="selectedGender">
        <option disabled value="">Select gender</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
      </BaseSelect>
    </FormGroup>

    <FormGroup label="Bow Type">
      <BaseSelect v-model="selectedBowType">
        <option disabled value="">Select bow type</option>
        <option value="recurve">Recurve</option>
        <option value="barebow">Barebow</option>
        <option value="longbow">Longbow</option>
        <option value="compound">Compound</option>
      </BaseSelect>
    </FormGroup>

    <FormGroup
      v-if="selectedBowType && showClassifications"
      :label="`${selectedBowType.charAt(0).toUpperCase() + selectedBowType.slice(1)} Outdoor Classification`"
    >
      <BaseSelect
        v-model="outdoorClassifications[selectedBowType]"
        @change="updateOutdoorClassification(selectedBowType, outdoorClassifications[selectedBowType])"
      >
        <option>Unclassified</option>
        <option v-for="option in classificationList" :value="option" :key="option">
          {{ option }}
        </option>
      </BaseSelect>
      <p class="help-text">If you're unsure, select "Unclassified"</p>
    </FormGroup>

    <FormGroup
      v-if="selectedBowType && showClassifications"
      :label="`${selectedBowType.charAt(0).toUpperCase() + selectedBowType.slice(1)} Indoor Classification`"
    >
      <BaseSelect
        v-model="indoorClassifications[selectedBowType]"
        @change="updateIndoorClassification(selectedBowType, indoorClassifications[selectedBowType])"
      >
        <option>Unclassified</option>
        <option v-for="option in classificationList" :value="option" :key="option">
          {{ option }}
        </option>
      </BaseSelect>
      <p class="help-text">If you're unsure, select "Unclassified"</p>
    </FormGroup>

    <ButtonGroup>
      <BaseButton
        variant="primary"
        :disabled="!isValid"
        @click="handleSubmit"
      >
        {{ submitText }}
      </BaseButton>
      <BaseButton
        v-if="showCancel"
        variant="text"
        @click="handleCancel"
      >
        {{ cancelText }}
      </BaseButton>
    </ButtonGroup>

    <p v-if="showClassifications" class="profile-note">
      You can update these details anytime in the "You" tab.
    </p>
  </SectionCard>
</template>

<style scoped>
.profile-intro {
  margin-bottom: 1rem;
  color: var(--color-text);
}

.help-text {
  font-size: 0.85rem;
  color: var(--color-text-light);
  margin-top: 0.25rem;
  margin-bottom: 0;
}

.error-message {
  color: var(--color-danger, #dc3545);
  font-size: 0.85rem;
  margin-top: 0.25rem;
}

.profile-note {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: var(--color-background-soft);
  border-left: 3px solid var(--color-highlight, #4CAF50);
  border-radius: 4px;
  font-size: 0.9rem;
}

.error {
  border-color: var(--color-danger, #dc3545) !important;
}
</style>