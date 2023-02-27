<script setup lang="ts">
import { watch, type PropType } from 'vue'
import { ref } from 'vue'

const emits = defineEmits(['update:modelValue'])

const props = defineProps({
  passBar: {
    type: String,
    required: true
  },
  modelValue: {
    type: Number,
    required: true
  },
  step: {
    type: Number,
    default: 1
  },
  max: {
    type: Number,
    required: true
  },
  classes: {
    type: String,
    default: ''
  },
  onInput: {
    type: Function as PropType<(value: number) => void>,
    required: true
  },
  onClick: {
    type: Function as PropType<(value: number) => void>,
    default: () => null
  }
})

let activeThumb = ref(0)
let inputValue = ref(props.modelValue)

const onInputChildred = () => {
  emits('update:modelValue', inputValue)
  props.onInput(inputValue.value)
}

const onKey = () => {
  emits('update:modelValue', inputValue.value)
  props.onClick(inputValue.value)
}

watch(
  () => props.modelValue,
  (cur) => (inputValue.value = cur)
)

const onClickChildren = () => {
  emits('update:modelValue', inputValue)
  props.onClick(inputValue.value)
}
</script>

<template>
  <input
    v-model.number="inputValue"
    type="range"
    min="0"
    :step="step"
    :class="classes"
    :max="max"
    @keyup.up="onKey"
    @keyup.down="onKey"
    @keyup.left="onKey"
    @keyup.right="onKey"
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
