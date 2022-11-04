<script setup lang="ts">
import { ref, watch, type PropType } from 'vue'

const emits = defineEmits(['update:modelValue'])

const props = defineProps({
  passBar: {
    type: String,
    required: true,
  },
  modelValue: {
    type: Number,
    required: true,
  },
  step: {
    type: Number,
    default: 1,
  },
  max: {
    type: Number,
    required: true,
  },
  classes: {
    type: String,
    default: '',
  },
  onInput: {
    type: Function as PropType<() => void>,
    required: true,
  },
  onClick: {
    type: Function as PropType<() => void>,
    default: () => null,
  },
})

const activeThumb = ref(0)

const inputValue = ref(props.modelValue)

const onInputChildred = () => {
  emits('update:modelValue', inputValue.value)
  props.onInput()
}

watch(
  () => props.modelValue,
  (cur) => (inputValue.value = cur)
)

const onClickChildren = () => {
  emits('update:modelValue', inputValue.value)
  props.onClick()
}
</script>

<template>
  <input
    v-model="inputValue"
    type="range"
    min="0"
    :step="step"
    :class="classes"
    :max="max"
    @mouseover="activeThumb = 1"
    @mouseleave="activeThumb = 0"
    @input="onInputChildred"
    @click="onClickChildren"
  />
</template>

<style scoepd lang="sass">

input
  &::before
    width: v-bind(passBar)
    content: ""
    height: 5px
    display: block
    background: var(--color-second)
    position: absolute
    border-radius: 50px
  &::-webkit-slider-thumb
    opacity: v-bind(activeThumb)
    position: relative
</style>
