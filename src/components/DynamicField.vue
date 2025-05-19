<script>
import {
  InputText,
  InputNumber,
  Textarea,
  Checkbox,
  DatePicker,
  Select,
  Button,
  Fieldset,
  IftaLabel
} from 'primevue'

export default {
  name: 'DynamicField',
  props: {
    field: { type: Object, required: true },
    modelValue: {
      type: [Object, String, Number, Boolean, Date, Array],
      default: null
    },
    editable: {
      type: Boolean,
      default: true
    }
  },
  components: {
    InputText,
    InputNumber,
    Textarea,
    Checkbox,
    DatePicker,
    Select,
    Button,
    Fieldset,
    IftaLabel,
    DynamicField: () => import('./DynamicField.vue')
  },
  computed: {
    isInputRow() {
      return ['string', 'boolean', 'date', 'select', 'number'].includes(this.field.type);
    },
    isFieldEditable() {
      return this.field.editable !== false && this.editable;
    }
  },
  methods: {
    emitChange(val) {
      this.$emit('update:modelValue', val);
    },
    headline(index) {
      const templateField = this.field.children?.find(c => c.template === 'headline');
      return templateField
        ? this.modelValue[index][templateField.key]
        : `Ítem ${index + 1}`;
    },
    addItem() {
      const arr = Array.isArray(this.modelValue) ? [...this.modelValue] : [];
      arr.push({});
      this.emitChange(arr);
    },
    removeItem(index) {
      const arr = [...this.modelValue];
      arr.splice(index, 1);
      this.emitChange(arr);
    },
    moveItemUp(index) {
      if (index <= 0) return;
      const arr = [...this.modelValue];
      [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
      this.emitChange(arr);
    },
    moveItemDown(index) {
      if (index >= this.modelValue.length - 1) return;
      const arr = [...this.modelValue];
      [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
      this.emitChange(arr);
    },
    getBasicFields(children) {
      return children?.filter(c => c.template !== 'advanced') || [];
    },
    getAdvancedFields(children) {
      return children?.filter(c => c.template === 'advanced') || [];
    }
  }
}
</script>

<template>
  <div class="p-fluid">
    <!-- Simple inputs -->
    <div v-if="isInputRow" class="input-row mb-4">
      <label :for="field.key" class="block text-sm font-medium text-gray-700 mb-1">
        {{ field.label }}<span v-if="field.required" class="text-red-500">*</span>
      </label>
      <component :is="field.type === 'string' ? 'InputText' :
          field.type === 'boolean' ? 'Checkbox' :
            field.type === 'date' ? 'DatePicker' :
              field.type === 'select' ? 'Select' :
                field.type === 'number' ? 'InputNumber' :
                  'InputText'
        " :modelValue="modelValue" @update:modelValue="emitChange" v-bind="{
          id: field.key,
          options: field.options,
          dateFormat: field.type === 'date' ? 'yy-mm-dd' : undefined,
          showIcon: field.type === 'date',
          binary: field.type === 'boolean'
        }" :disabled="!isFieldEditable" class="w-full" :class="{ 'non-editable': !isFieldEditable }" />
    </div>

    <!-- Rich text -->
    <div v-else-if="field.type === 'richtext'" class="mb-4">
      <label :for="field.key" class="block text-sm font-medium text-gray-700 mb-1">
        {{ field.label }}<span v-if="field.required" class="text-red-500">*</span>
      </label>
      <Textarea :modelValue="modelValue" @update:modelValue="emitChange" :id="field.key" :disabled="!isFieldEditable"
        class="w-full" :class="{ 'non-editable': !isFieldEditable }" />
    </div>

    <!-- Array of objects with reorder and remove -->
    <div v-else-if="field.type === 'array' && field.itemType === 'object'">
      <div class="flex justify-between items-center mb-2">
        <h3 class="text-lg font-semibold">{{ field.label }}</h3>
        <Button icon="pi pi-plus" @click="addItem" :disabled="!editable" />
      </div>

      <Fieldset v-for="(item, i) in modelValue" :key="i" :legend="headline(i)" toggleable collapsed class="mb-4">
        <!-- Basic child fields -->
        <DynamicField v-for="child in getBasicFields(field.children)" :key="child.key + i" :field="child"
          :modelValue="item[child.key]"
          @update:modelValue="val => { const arr = [...modelValue]; arr[i] = { ...arr[i], [child.key]: val }; emitChange(arr); }"
          :editable="editable" />

        <!-- Advanced child fields -->
        <Fieldset legend="Opciones avanzadas" toggleable collapsed class="mt-2 mb-2">
          <DynamicField v-for="child in getAdvancedFields(field.children)" :key="child.key + i + 'adv'" :field="child"
            :modelValue="item[child.key]"
            @update:modelValue="val => { const arr = [...modelValue]; arr[i] = { ...arr[i], [child.key]: val }; emitChange(arr); }"
            :editable="editable" />
        </Fieldset>

        <!-- Reorder and remove buttons -->
        <div class="flex gap-2 justify-end mt-2">
          <Button icon="pi pi-arrow-up" @click="moveItemUp(i)" :disabled="i === 0" size="small" rounded />
          <Button icon="pi pi-arrow-down" @click="moveItemDown(i)" :disabled="i === modelValue.length - 1" size="small"
            rounded />
          <Button icon="pi pi-trash" label="Eliminar ítem" @click="removeItem(i)"
            :disabled="hasNonEditableChild() || !editable" severity="danger" size="small" />
        </div>
      </Fieldset>
    </div>

    <!-- Nested object -->
    <div v-else-if="field.type === 'object'">
      <DynamicField v-for="child in field.children" :key="child.key" :field="child" :modelValue="modelValue[child.key]"
        @update:modelValue="val => {
          const obj = { ...modelValue, [child.key]: val }; emitChange(obj);
        }" :editable="editable" />
    </div>
  </div>
</template>

<style scoped>
.input-row {
  display: flex;
  flex-direction: column;
}

.mb-4 {
  margin-bottom: 1rem;
}

.non-editable {
  background-color: #f5f5f5;
  cursor: not-allowed;
}
</style>
