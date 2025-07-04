<script>
import {
  InputText,
  InputNumber,
  Textarea,
  Checkbox,
  DatePicker,
  Select,
  Button,
  Fieldset
} from 'primevue'
import { v4 as uuid } from 'uuid'
import rfdc from 'rfdc'
import { defineAsyncComponent } from 'vue'
import dbService from '@/dbService'


// clon profundo robusto
const clone = rfdc()

export default {
  name: 'DynamicField',
  components: {
    InputText,
    InputNumber,
    Textarea,
    Checkbox,
    DatePicker,
    Select,
    Button,
    Fieldset,
    // importación recursiva asíncrona para subcampos
    DynamicField: defineAsyncComponent(() => import('./DynamicField.vue'))
  },

  data() {
    return {
      userOptions: []
    }
  },

  props: {
    field: { type: Object, required: true },
    modelValue: { type: [String, Number, Boolean, Date, Array, Object], default: null },
    editable: { type: Boolean, default: true },
    prefix: { type: String, default: '' }       // ruta padre, e.g. "arreglo[0]"
  },

  computed: {
    // ruta completa para key/id y para set()
    resolvedPrefix() {
      return this.prefix
        ? `${this.prefix}.${this.field.key}`
        : this.field.key
    },
    // decide si es un input simple
    isInputRow() {
      return ['string', 'boolean', 'date', 'select', 'number']
        .includes(this.field.type)
    },
    // controla disabled
    isFieldEditable() {
      return this.field.editable !== false && this.editable
    },
    // mapea a componente de PrimeVue
    inputComponent() {
      const t = this.field.type
      return t === 'string' ? 'InputText'
        : t === 'boolean' ? 'Checkbox'
          : t === 'date' ? 'DatePicker'
            : t === 'select' ? 'Select'
              : t === 'number' ? 'InputNumber'
                : t === 'image' ? 'image'
                  : t === 'user' ? 'userSelector'
                    : 'InputText'
    }
  },

  methods: {
    /**
     * Emite SIEMPRE { path, value }.
     * El padre (MetaEditDialog) usará lodash.set(formData, path, value).
     */
    emitFieldChange(path, value) {
      // y también emitimos el valor completo del modelo
      this.$emit('update:modelValue', value)
      // emitimos path y value por separado
      this.$emit('field-change', path, value)
    },

    headline(i) {
      const h = this.field.children?.find(c => c.template === 'headline')
      return h
        ? (this.modelValue?.[i] || {})[h.key]
        : `Ítem ${i + 1}`
    },

    /** Añade un nuevo objeto al array y emite el array completo */
    addItem() {
      const arr = Array.isArray(this.modelValue)
        ? clone(this.modelValue)
        : []
      const template = (this.field.children || []).reduce((o, c) => {
        o[c.key] = c.defaultValue ?? ''
        return o
      }, {})
      arr.push({ id: uuid(), ...template })
      this.emitFieldChange(this.resolvedPrefix, arr)
    },

    /** Elimina por índice y emite el array completo */
    removeItem(i) {
      const arr = clone(this.modelValue || [])
      arr.splice(i, 1)
      this.emitFieldChange(this.resolvedPrefix, arr)
    },

    /** Intercambia hacia arriba y emite el array completo */
    moveItemUp(i) {
      if (i === 0) return
      const arr = clone(this.modelValue || [])
        ;[arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]
      this.emitFieldChange(this.resolvedPrefix, arr)
    },

    /** Intercambia hacia abajo y emite el array completo */
    moveItemDown(i) {
      const arr = clone(this.modelValue || [])
      if (i === arr.length - 1) return
        ;[arr[i], arr[i + 1]] = [arr[i + 1], arr[i]]
      this.emitFieldChange(this.resolvedPrefix, arr)
    },

    /**
     * Cuando cambia un campo dentro de un array,
     * EMITE SÓLO esa ruta puntual y el valor.
     */
    onChildChange(i, key, val) {
      this.emitFieldChange(
        `${this.resolvedPrefix}[${i}].${key}`,
        val
      )
    },

    /** Para objetos anidados */
    updateNested(key, val) {
      this.emitFieldChange(
        `${this.resolvedPrefix}.${key}`,
        val
      )
    },

    getBasicFields(children) {
      return (children || []).filter(c => c.template !== 'advanced')
    },
    getAdvancedFields(children) {
      return (children || []).filter(c => c.template === 'advanced')
    },
    async onImageChange(e) {
      const file = e.target.files[0]
      if (!file) return

      const filePath = `${this.field.key}/${Date.now()}-${file.name}`

      const uploadRes = await dbService.uploadFile(filePath, file)
      if (uploadRes.success) {
        const urlRes = await dbService.getFileURL(filePath)
        if (urlRes.success) {
          this.emitFieldChange(this.resolvedPrefix, urlRes.url)
        } else {
          console.error('[DynamicField] Error al obtener URL:', urlRes.message)
        }
      } else {
        console.error('[DynamicField] Error al subir imagen:', uploadRes.message)
      }
    }
  },
  async mounted() {
    if (this.field.type === 'user') {
      const res = await dbService.fetchCollection('users')
      if (res.success) {
        const keys = this.field.options.map(o => o.key)
        this.userOptions = res.data.map(user => {
          const u = {}
          keys.forEach(k => u[k] = user[k])
          return u
        })
      }
    }
  }
}
</script>

<template>
  <div class="p-fluid">

    <!-- 1) Inputs simples -->
    <div v-if="isInputRow" class="input-row mb-4">
      <label :for="resolvedPrefix" class="block text-sm font-medium mb-1">
        {{ field.label }}
        <span v-if="field.required" class="text-red-500">*</span>
      </label>
      <component :is="inputComponent" :modelValue="modelValue"
        @update:modelValue="val => emitFieldChange(resolvedPrefix, val)" :key="resolvedPrefix" :id="resolvedPrefix"
        :options="field.options" optionLabel="label" optionValue="value" dateFormat="yy-mm-dd" showIcon binary
        :disabled="!isFieldEditable" class="w-full p-2" />
    </div>

    <!-- 2) Richtext -->
    <div v-else-if="field.type === 'richtext'" class="mb-4">
      <label :for="resolvedPrefix" class="block text-sm font-medium mb-1">
        {{ field.label }}
        <span v-if="field.required" class="text-red-500">*</span>
      </label>
      <Textarea :modelValue="modelValue" @update:modelValue="val => emitFieldChange(resolvedPrefix, val)"
        :key="resolvedPrefix" :id="resolvedPrefix" :disabled="!isFieldEditable" class="w-full p-2" />
    </div>

    <!-- 3) Array de objetos -->
    <div v-else-if="field.type === 'array' && field.itemType === 'object'">
      <div class="flex justify-between items-center mb-2">
        <h3 class="text-lg font-semibold">{{ field.label }}</h3>
        <Button icon="pi pi-plus" @click="addItem" :disabled="!editable" />
      </div>

      <Fieldset v-for="(item, i) in modelValue || []" :key="`${resolvedPrefix}[${i}]`" :legend="headline(i)" toggleable
        collapsed class="mb-4">
        <!-- Campos básicos dentro del array -->
        <DynamicField v-for="child in getBasicFields(field.children)" :key="`${resolvedPrefix}[${i}].${child.key}`"
          :prefix="`${resolvedPrefix}[${i}]`" :field="child" :modelValue="item[child.key]"
          @field-change="emitFieldChange" @update:modelValue="val => onChildChange(i, child.key, val)"
          :editable="editable" />

        <!-- Opciones avanzadas -->
        <Fieldset v-if="getAdvancedFields(field.children).length" legend="Opciones avanzadas" toggleable collapsed
          class="mt-2 mb-2">
          <DynamicField v-for="child in getAdvancedFields(field.children)"
            :key="`${resolvedPrefix}[${i}].${child.key}.adv`" :prefix="`${resolvedPrefix}[${i}]`" :field="child"
            :modelValue="item[child.key]" @field-change="emitFieldChange"
            @update:modelValue="val => onChildChange(i, child.key, val)" :editable="editable" />
        </Fieldset>

        <!-- Controles mover/eliminar -->
        <div class="flex gap-2 justify-end mt-2">
          <Button icon="pi pi-arrow-up" @click="moveItemUp(i)" :disabled="i === 0" size="small" rounded />
          <Button icon="pi pi-arrow-down" @click="moveItemDown(i)" :disabled="i === (modelValue || []).length - 1"
            size="small" rounded />
          <Button icon="pi pi-trash" label="Eliminar ítem" @click="removeItem(i)" :disabled="!editable"
            severity="danger" size="small" />
        </div>
      </Fieldset>
    </div>

    <!-- 4) Objeto anidado -->
    <div v-else-if="field.type === 'object'" class="mb-4">
      <DynamicField v-for="child in field.children" :key="`${resolvedPrefix}.${child.key}`" :prefix="resolvedPrefix"
        :field="child" :modelValue="modelValue?.[child.key]" @field-change="emitFieldChange"
        @update:modelValue="val => updateNested(child.key, val)" :editable="editable" />
    </div>

    <!-- 5) Fallback -->
    <!-- <div v-else class="text-red-500">
      Tipo de campo “{{ field.type }}” no soportado.
    </div>-->

    <!-- 6) Imagen con subida -->
    <div v-else-if="field.type === 'image'" class="mb-4">
      <label class="block text-sm font-medium mb-1">{{ field.label }}</label>
      <input type="file" accept="image/*" @change="onImageChange" class="mb-2" :disabled="!isFieldEditable" />
      <img v-if="modelValue" :src="modelValue" alt="Vista previa" class="rounded shadow max-h-48 object-cover" />
    </div>
    <!-- Selector de usuario con foto + nombre -->
    <div v-else-if="field.type === 'user'" class="mb-4">
      <label class="block text-sm font-medium mb-1">
        {{ field.label }}
        <span v-if="field.required" class="text-red-500">*</span>
      </label>
      <Dropdown :modelValue="modelValue" @update:modelValue="val => emitFieldChange(resolvedPrefix, val)"
        :options="userOptions" optionLabel="name" optionValue="id" :filter="true" :disabled="!isFieldEditable"
        placeholder="Seleccionar usuario" class="w-full">
        <template #value="slotProps">
          <div v-if="slotProps.value" class="flex items-center gap-2">
            <img :src="slotProps.value.photoURL" class="w-6 h-6 rounded-full" alt="avatar" />
            <span>{{ slotProps.value.name }}</span>
          </div>
          <span v-else class="text-gray-400">Seleccionar usuario</span>
        </template>

        <template #option="slotProps">
          <div class="flex items-center gap-2">
            <img :src="slotProps.option.photoURL" class="w-6 h-6 rounded-full" alt="avatar" />
            <span>{{ slotProps.option.name }}</span>
          </div>
        </template>
      </Dropdown>
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

.w-full {
  width: 100%;
}

.p-2 {
  padding: 0.5rem;
}
</style>
