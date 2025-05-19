<!-- components/widgets/OrderModal.vue -->
<template>
  <Dialog
    :visible="visible"
    :header="isEdit ? 'Редактировать заказ' : 'Создать заказ'"
    modal
    @update:visible="onCancel"
  >
    <div class="form-container">
      <div class="field">
        <label for="number">Номер</label>
        <InputText
          id="number"
          v-model="localOrder.number"
          :class="{ 'p-invalid': errors.number }"
        />
        <small v-if="errors.number" class="p-error">{{ errors.number }}</small>
      </div>
      <div class="field">
        <label for="type">Тип</label>
        <Dropdown
          id="type"
          v-model="localOrder.type.code"
          :options="orderTypes"
          optionLabel="displayValue"
          optionValue="code"
          placeholder="Выберите тип"
        />
      </div>
      <div class="field">
        <label for="status">Статус</label>
        <Dropdown
          id="status"
          v-model="localOrder.status.code"
          :options="orderStatuses"
          optionLabel="displayValue"
          optionValue="code"
          placeholder="Выберите статус"
        />
      </div>
      <div class="field">
        <label for="warehouse">Склад</label>
        <Dropdown
          id="warehouse"
          :model-value="localOrder.warehouse.id"
          :options="warehouses"
          optionLabel="displayValue"
          optionValue="id"
          placeholder="Выберите склад"
          :class="{ 'p-invalid': errors.warehouse }"
          @update:model-value="
            (newValue) =>
              (localOrder.warehouse = {
                id: newValue,
                displayValue:
                  warehouses.find((w) => w.id === newValue)?.displayValue || '',
              })
          "
        />
        <small v-if="errors.warehouse" class="p-error">{{
          errors.warehouse
        }}</small>
      </div>
      <div class="field">
        <label for="organization">Организация</label>
        <Dropdown
          id="organization"
          :model-value="localOrder.organization.id"
          :options="organizations"
          optionLabel="displayValue"
          optionValue="id"
          placeholder="Выберите организацию"
          :class="{ 'p-invalid': errors.organization }"
          @update:model-value="
            (newValue) =>
              (localOrder.organization = {
                id: newValue,
                displayValue:
                  organizations.find((o) => o.id === newValue)?.displayValue ||
                  '',
              })
          "
        />
        <small v-if="errors.organization" class="p-error">{{
          errors.organization
        }}</small>
      </div>
      <div class="field">
        <label for="contact">Контакт</label>
        <Dropdown
          id="contact"
          :model-value="localOrder.contact.id"
          :options="contacts"
          optionLabel="fullName"
          optionValue="id"
          placeholder="Выберите контакт"
          :class="{ 'p-invalid': errors.contact }"
          @update:model-value="
            (newValue) =>
              (localOrder.contact = {
                id: newValue,
                displayValue:
                  contacts.find((o) => o.id === newValue)?.fullName || '',
              })
          "
        />
        <small v-if="errors.contact" class="p-error">{{
          errors.contact
        }}</small>
      </div>
      <div class="field">
        <label for="comment">Комментарий</label>
        <Textarea id="comment" v-model="localOrder.comment" rows="4" />
      </div>
    </div>
    <template #footer>
      <Button label="Отмена" icon="pi pi-times" text @click="onCancel" />
      <Button label="Сохранить" icon="pi pi-check" @click="onSave" />
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import { ref, watch, computed, onMounted } from "vue";
import { useWarehouseStore } from "@/stores/warehouseStore";
import { useOrganizationStore } from "@/stores/organizationStore";
import { contactService } from "@/services/contactService";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Dropdown from "primevue/dropdown";
import Textarea from "primevue/textarea";
import Button from "primevue/button";
import type { Order, PersonContact } from "@/types/models";

const props = defineProps<{
  visible: boolean;
  order: Order | null;
  isEdit: boolean;
}>();

const emit = defineEmits<{
  (e: "save", order: Order): void;
  (e: "cancel"): void;
}>();

const warehouseStore = useWarehouseStore();
const organizationStore = useOrganizationStore();
const localOrder = ref<Order>({
  number: "",
  type: { code: "incoming", displayValue: "Входящий" },
  status: { code: "draft", displayValue: "Черновик" },
  organization: { id: "", displayValue: "" },
  contact: { id: "", displayValue: "" },
  warehouse: { id: "", displayValue: "" },
  comment: "",
});

const errors = ref({
  number: "",
  warehouse: "",
  organization: "",
  contact: "",
});

const orderTypes = [
  { code: "incoming", displayValue: "Входящий" },
  { code: "outgoing", displayValue: "Исходящий" },
];

const orderStatuses = [
  { code: "draft", displayValue: "Черновик" },
  { code: "approved", displayValue: "Утверждён" },
];

const warehouses = computed(() =>
  warehouseStore.warehouses.map((w) => ({
    id: w.id,
    displayValue: w.name,
  }))
);

const organizations = computed(() =>
  organizationStore.organizations.map((o) => ({
    id: o.id,
    displayValue: o.name,
  }))
);

const contacts = ref<PersonContact[]>([]);

onMounted(async () => {
  try {
    await Promise.all([
      warehouseStore.fetchAll(),
      organizationStore.filter(),
      (async () => {
        contacts.value = await contactService.getAll();
      })(),
    ]);
  } catch (err) {
    console.error("Ошибка загрузки данных:", err);
  }
});

watch(
  () => props.order,
  (newOrder) => {
    if (newOrder) {
      localOrder.value = { ...newOrder };
    }
  },
  { immediate: true }
);

function validate(): boolean {
  errors.value = {
    number: "",
    warehouse: "",
    organization: "",
    contact: "",
  };
  let isValid = true;
  if (!localOrder.value.number) {
    errors.value.number = "Номер обязателен";
    isValid = false;
  }
  if (!localOrder.value.warehouse.id) {
    errors.value.warehouse = "Склад обязателен";
    isValid = false;
  }
  if (!localOrder.value.organization.id) {
    errors.value.organization = "Организация обязательна";
    isValid = false;
  }
  if (!localOrder.value.contact.id) {
    errors.value.contact = "Контакт обязателен";
    isValid = false;
  }
  return isValid;
}

function onSave() {
  if (validate()) {
    emit("save", localOrder.value);
  }
}

function onCancel() {
  emit("cancel");
}
</script>

<style scoped>
.form-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.p-error {
  color: red;
}
</style>
