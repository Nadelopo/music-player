<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  passBar: string
  modelValue: number
  step?: number
  max: number
  classes?: string
  onInput: (value: number) => void
  onClick?: (value: number) => void
}

const props = withDefaults(defineProps<Props>(), {
  step: 1,
  classes: '',
  onClick: () => null
})

const emits = defineEmits(['update:modelValue'])

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
