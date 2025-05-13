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
      this.$emit('update:modelValue', val)
    },
    headline(ind) {
      if (this.field.children && this.field.type === 'array' && this.field.itemType === 'object') {
        const val = this.field.children.find(item => item.template === 'headline');
        return val ? this.modelValue[ind][val.key] : 'Ítem';
      }
      return this.modelValue[ind];
    },
    addItem() {
      this.modelValue ||= [];
      this.emitChange([...this.modelValue, {}]);
    },
    removeItem(index) {
      const arr = [...this.modelValue];
      arr.splice(index, 1);
      this.emitChange(arr);
    },
    hasNonEditableChild() {
      return this.field.children?.some(child => child.editable === false);
    },
    getAdvancedFields(children) {
      return children.filter(child => child.template === 'advanced');
    },
    getBasicFields(children) {
      return children.filter(child => child.template !== 'advanced');
    }
  }
}
</script>

<template>
  <div class="p-fluid">
    <div v-if="isInputRow" class="input-row">
      <label :for="field.key" class="field-label">
        {{ field.label }}
        <i v-if="!isFieldEditable" class="pi pi-lock lock-icon" />
      </label>

      <InputText
        v-if="field.type === 'string'"
        :modelValue="modelValue"
        @update:modelValue="emitChange"
        :id="field.key"
        :disabled="!isFieldEditable"
        :class="{ 'non-editable': !isFieldEditable }"
      />

      <Checkbox
        v-else-if="field.type === 'boolean'"
        :modelValue="modelValue"
        @update:modelValue="emitChange"
        :inputId="field.key"
        binary
        :disabled="!isFieldEditable"
        :class="{ 'non-editable': !isFieldEditable }"
      />

      <DatePicker
        v-else-if="field.type === 'date'"
        :modelValue="modelValue"
        @update:modelValue="emitChange"
        :id="field.key"
        dateFormat="yy-mm-dd"
        showIcon
        :disabled="!isFieldEditable"
        :class="{ 'non-editable': !isFieldEditable }"
      />

      <Select
        v-else-if="field.type === 'select'"
        :modelValue="modelValue"
        @update:modelValue="emitChange"
        :options="field.options"
        :id="field.key"
        placeholder="Elija uno"
        :disabled="!isFieldEditable"
        :class="{ 'non-editable': !isFieldEditable }"
      />

      <InputNumber
        v-else-if="field.type === 'number'"
        :modelValue="modelValue"
        @update:modelValue="emitChange"
        :id="field.key"
        placeholder="0"
        :disabled="!isFieldEditable"
        :class="{ 'non-editable': !isFieldEditable }"
      />
    </div>

    <IftaLabel v-else-if="field.type === 'richtext'">
      <label :for="field.key" class="field-label">
        {{ field.label }}
        <i v-if="!isFieldEditable" class="pi pi-lock lock-icon" />
      </label>
      <Textarea
        :modelValue="modelValue"
        @update:modelValue="emitChange"
        :id="field.key"
        :disabled="!isFieldEditable"
        :class="{ 'non-editable': !isFieldEditable }"
      />
    </IftaLabel>

    <div v-else-if="field.type === 'array' && field.itemType === 'object'">
      <div class="input-row" style="margin-bottom: 0;">
        <h2>{{ field.label }}</h2>
        <Button icon="pi pi-plus" @click="addItem" severity="secondary" :disabled="!editable" />
      </div>

      <Fieldset
        v-for="(item, i) in modelValue"
        :key="i"
        :legend="headline(i)"
        toggleable
        collapsed
      >
        <DynamicField
          v-for="child in getBasicFields(field.children)"
          :key="child.key + i"
          :field="child"
          :modelValue="item[child.key]"
          @update:modelValue="val => {
            const arr = [...modelValue]; arr[i] = { ...arr[i], [child.key]: val }; emitChange(arr);
          }"
          :editable="editable"
        />
        <Fieldset legend="Opciones avanzadas" toggleable collapsed>
          <DynamicField
            v-for="child in getAdvancedFields(field.children)"
            :key="child.key + i + 'adv'"
            :field="child"
            :modelValue="item[child.key]"
            @update:modelValue="val => {
              const arr = [...modelValue]; arr[i] = { ...arr[i], [child.key]: val }; emitChange(arr);
            }"
            :editable="editable"
          />
        </Fieldset>
        <div class="flex-end">
          <Button icon="pi pi-trash" label="Eliminar ítem" @click="removeItem(i)" :disabled="hasNonEditableChild() || !editable" />
        </div>
      </Fieldset>
    </div>

    <div v-else-if="field.type === 'object'">
      <DynamicField
        v-for="child in field.children"
        :key="child.key"
        :field="child"
        :modelValue="modelValue[child.key]"
        @update:modelValue="val => {
          const obj = { ...modelValue, [child.key]: val }; emitChange(obj);
        }"
        :editable="editable"
      />
    </div>
  </div>
</template>

<style scoped>
.input-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 8px 0;
}
.flex-end {
  display: flex;
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
}
.field-label {
  display: flex;
  align-items: center;
  font-weight: 600;
  margin-bottom: 0.25rem;
  gap: 0.5rem;
}
</style>