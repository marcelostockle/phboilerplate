<script>
import { InputText, Textarea, Checkbox, DatePicker, Select, Button,
  Fieldset, IftaLabel } from 'primevue'

export default {
  name: 'DynamicField',
  props: {
    field: Object,
    modelValue: Object
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
    DynamicField: () => import('./DynamicField.vue') // recursive self-import
  },
  computed: {
    isInputRow() {
      return this.field.type === 'string' || this.field.type === 'boolean' ||
        this.field.type === 'date' || this.field.type === 'select';
    },
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
      this.modelValue[this.field.key] ||= []; // Initialize if undefined
      this.modelValue[this.field.key].push({});
    },
    removeItem(index) {
      this.modelValue[this.field.key].splice(index, 1)
    },
  }
}
</script>

<template>
  <div class="p-fluid">
    <!-- Render string, boolean, etc. -->
    <div v-if="isInputRow" class="input-row">
      <label :for="field.key">{{ field.label }}</label>
      <InputText
        v-if="field.type === 'string'"
        v-model="modelValue[field.key]"
        :id="field.key" />
      <Checkbox
        v-else-if="field.type === 'boolean'"
        v-model="modelValue[field.key]"
        :inputId="field.key"
        binary
      />
      <DatePicker
        v-else-if="field.type === 'date'"
        v-model="modelValue[field.key]"
        :id="field.key"
        dateFormat="yy-mm-dd"
        showIcon
      />
      <Select
        v-else-if="field.type === 'select'"
        v-model="modelValue[field.key]"
        :options="field.options"
        :id="field.key"
        placeholder="Elija uno"
      />
    </div>

    <!---Text Editor--->
    <IftaLabel v-else-if="field.type === 'richtext'">
      <Textarea class="wide"
        v-model="modelValue[field.key]"
        :id="field.key" />
      <label :for="field.key">{{ field.label }}</label>
    </IftaLabel>

    <!-- Array of objects -->
    <div v-else-if="field.type === 'array' && field.itemType === 'object'">
      <div class="input-row" style="margin-bottom: 0;">
        <h2 style="color: inherit">{{ field.label }}</h2>
        <Button icon="pi pi-plus" @click="addItem" severity="secondary"/>
      </div>
      <Fieldset v-for="(item, i) in modelValue[field.key]" :key="i"
      :legend="headline(i)" :toggleable="true" :collapsed="true">
        <DynamicField
          v-for="childField in field.children"
          :key="childField.key+i"
          :field="childField"
          :modelValue="item"
        />
        <div class="flex-end">
          <Button icon="pi pi-trash" @click="removeItem(i)"/>
        </div>
      </Fieldset>
    </div>

    <!-- Object -->
    <div v-else-if="field.type === 'object'">
      <DynamicField
        v-for="childField in field.children"
        :key="childfield.key"
        :field="childField"
        :modelValue="modelValue[field.key]"
      />
    </div>
  </div>
</template>

<style>
.input-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin: 8px 0;
  align-items: center;
}
.flex-end {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
}
.wide {
  width: 100%;
}
</style>
