<script>
import {
  InputText, Textarea, Checkbox, DatePicker, Select, Button,
  Fieldset, IftaLabel
} from 'primevue'

export default {
  name: 'DynamicField',
  props: {
    field: Object,
    modelValue: Object,
    editable: {
      type: Boolean,
      default: true
    }
  },
  components: {
    InputText,
    Textarea,
    Checkbox,
    DatePicker,
    Select,
    Button,
    Fieldset,
    IftaLabel,
    DynamicField: () => import('./DynamicField.vue') // recursive
  },
  computed: {
    isInputRow() {
      return this.field.type === 'string' || this.field.type === 'boolean' ||
        this.field.type === 'date' || this.field.type === 'select';
    },
    isFieldEditable() {
      return this.field.editable !== false && this.editable;
    }
  },
  methods: {
    headline(ind) {
      if (this.field.children && this.field.type === 'array' && this.field.itemType === 'object') {
        const val = this.field.children.find(item => item.display === 'headline');
        return val ? this.modelValue[this.field.key][ind][val.key] : 'Objeto';
      }
      return this.modelValue[this.field.key];
    },
    addItem() {
      this.modelValue[this.field.key] ||= [];
      this.modelValue[this.field.key].push({});
    },
    removeItem(index) {
      this.modelValue[this.field.key].splice(index, 1);
    },
    hasNonEditableChild() {
      return this.field.children?.some(child => child.editable === false);
    }
  }
}
</script>

<template>
  <div class="p-fluid">

    <!-- String, boolean, date, select -->
    <div v-if="isInputRow" class="input-row">
      <label :for="field.key" class="field-label">
        {{ field.label }}
        <i v-if="!isFieldEditable" class="pi pi-lock lock-icon" title="Campo no editable" />
      </label>

      <template v-if="field.type === 'string'">
        <InputText
          v-model="modelValue[field.key]"
          :id="field.key"
          :disabled="!isFieldEditable"
          :class="{ 'non-editable': !isFieldEditable }"
        />
      </template>

      <template v-else-if="field.type === 'boolean'">
        <Checkbox
          v-model="modelValue[field.key]"
          :inputId="field.key"
          binary
          :disabled="!isFieldEditable"
          :class="{ 'non-editable': !isFieldEditable }"
        />
      </template>

      <template v-else-if="field.type === 'date'">
        <DatePicker
          v-model="modelValue[field.key]"
          :id="field.key"
          dateFormat="yy-mm-dd"
          showIcon
          :disabled="!isFieldEditable"
          :class="{ 'non-editable': !isFieldEditable }"
        />
      </template>

      <template v-else-if="field.type === 'select'">
        <Select
          v-model="modelValue[field.key]"
          :options="field.options"
          :id="field.key"
          placeholder="Elija uno"
          :disabled="!isFieldEditable"
          :class="{ 'non-editable': !isFieldEditable }"
        />
      </template>
    </div>

    <!-- Richtext -->
    <IftaLabel v-else-if="field.type === 'richtext'">
      <label :for="field.key" class="field-label">
        {{ field.label }}
        <i v-if="!isFieldEditable" class="pi pi-lock lock-icon" title="Campo no editable" />
      </label>
      <Textarea
        class="wide"
        v-model="modelValue[field.key]"
        :id="field.key"
        :disabled="!isFieldEditable"
        :class="{ 'non-editable': !isFieldEditable }"
      />
    </IftaLabel>

    <!-- Array of objects -->
    <div v-else-if="field.type === 'array' && field.itemType === 'object'">
      <div class="input-row" style="margin-bottom: 0;">
        <h2 style="color: inherit">{{ field.label }}</h2>
        <Button icon="pi pi-plus" @click="addItem" severity="secondary" :disabled="!editable" />
      </div>
      <Fieldset
        v-for="(item, i) in modelValue[field.key]"
        :key="i"
        :legend="headline(i)"
        toggleable
        collapsed
      >
        <DynamicField
          v-for="childField in field.children"
          :key="childField.key + i"
          :field="childField"
          :modelValue="item"
          :editable="editable"
        />
        <div class="flex-end">
          <Button
            icon="pi pi-trash"
            @click="removeItem(i)"
            :disabled="hasNonEditableChild() || !editable"
          />
        </div>
      </Fieldset>
    </div>

    <!-- Object -->
    <div v-else-if="field.type === 'object'">
      <DynamicField
        v-for="childField in field.children"
        :key="childField.key"
        :field="childField"
        :modelValue="modelValue[field.key]"
        :editable="editable"
      />
    </div>

  </div>
</template>

<style scoped>
.input-row {
  display: flex;
  flex-direction: column;
  margin: 8px 0;
}

.flex-end {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
}

.wide {
  width: 100%;
}

.non-editable {
  background-color: #f0f0f0 !important;
  cursor: not-allowed;
}

.lock-icon {
  margin-left: 0.4rem;
  color: #999;
  font-size: 1rem;
}

.field-label {
  display: flex;
  align-items: center;
  font-weight: 600;
  margin-bottom: 0.25rem;
  gap: 0.5rem;
}
</style>
