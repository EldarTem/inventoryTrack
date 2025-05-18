<template>
  <Dialog
    :visible="visible"
    :header="isEdit ? 'Редактировать поставщика' : 'Создать поставщика'"
    :modal="true"
    :style="{ width: '600px' }"
    @update:visible="emit('cancel')"
    class="supplier-modal"
  >
    <div class="form-container">
      <div class="form-field">
        <label for="name">Название</label>
        <InputText
          id="name"
          v-model="localSupplier.name"
          placeholder="Введите название"
          class="p-inputtext-lg"
          :class="{ 'p-invalid': errors.name }"
        />
        <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
      </div>
      <div class="form-field">
        <label for="legalForm">Организационно-правовая форма</label>
        <Dropdown
          id="legalForm"
          v-model="localSupplier.legalForm"
          :options="legalForms"
          optionLabel="label"
          optionValue="value"
          placeholder="Выберите форму"
          class="p-inputtext-lg"
          :class="{ 'p-invalid': errors.legalForm }"
        />
        <small v-if="errors.legalForm" class="p-error">{{
          errors.legalForm
        }}</small>
      </div>
      <div class="form-field">
        <label for="inn">ИНН</label>
        <InputText
          id="inn"
          v-model="localSupplier.inn"
          placeholder="Введите ИНН"
          class="p-inputtext-lg"
          :class="{ 'p-invalid': errors.inn }"
        />
        <small v-if="errors.inn" class="p-error">{{ errors.inn }}</small>
      </div>
      <div class="form-field">
        <label for="kpp">КПП</label>
        <InputText
          id="kpp"
          v-model="localSupplier.kpp"
          placeholder="Введите КПП"
          class="p-inputtext-lg"
          :class="{ 'p-invalid': errors.kpp }"
        />
        <small v-if="errors.kpp" class="p-error">{{ errors.kpp }}</small>
      </div>
      <div class="form-field">
        <label for="ogrn">ОГРН</label>
        <InputText
          id="ogrn"
          v-model="localSupplier.ogrn"
          placeholder="Введите ОГРН"
          class="p-inputtext-lg"
          :class="{ 'p-invalid': errors.ogrn }"
        />
        <small v-if="errors.ogrn" class="p-error">{{ errors.ogrn }}</small>
      </div>
      <div class="form-field">
        <label for="address">Адрес</label>
        <InputText
          id="address"
          v-model="localSupplier.address"
          placeholder="Введите адрес"
          class="p-inputtext-lg"
          :class="{ 'p-invalid': errors.address }"
        />
        <small v-if="errors.address" class="p-error">{{
          errors.address
        }}</small>
      </div>
      <div class="form-field">
        <label for="primaryContact">Основной контакт</label>
        <Dropdown
          id="primaryContact"
          :model-value="localSupplier.primaryContact.id"
          :options="contacts"
          optionLabel="fullName"
          optionValue="id"
          placeholder="Выберите контакт"
          class="p-inputtext-lg"
          :class="{ 'p-invalid': errors.primaryContact }"
          @update:model-value="
            (newValue) =>
              (localSupplier.primaryContact = {
                id: newValue,
                displayValue:
                  contacts.find((c) => c.id === newValue)?.fullName || '',
              })
          "
        />
        <small v-if="errors.primaryContact" class="p-error">{{
          errors.primaryContact
        }}</small>
      </div>
      <div class="form-field buttons">
        <Button
          label="Отмена"
          icon="pi pi-times"
          class="p-button-secondary p-button-lg"
          @click="emit('cancel')"
        />
        <Button
          label="Сохранить"
          icon="pi pi-check"
          class="p-button-lg"
          @click="handleSave"
        />
      </div>
    </div>
  </Dialog>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted } from "vue";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Dropdown from "primevue/dropdown";
import Button from "primevue/button";
import { contactService } from "@/services/contactService";
import type { Organization, PersonContact } from "@/types/models";

const props = defineProps<{
  visible: boolean;
  supplier: Organization | null;
  isEdit: boolean;
}>();

const emit = defineEmits<{
  (e: "save", supplier: Organization): void;
  (e: "cancel"): void;
}>();

const localSupplier = ref<Organization>({
  id: "",
  name: "",
  legalForm: "",
  inn: "",
  kpp: "",
  ogrn: "",
  address: "",
  phone: "",
  email: "",
  type: { code: "supplier", displayValue: "Поставщик" },
  primaryContact: { id: "", displayValue: "" },
});

const errors = ref({
  name: "",
  legalForm: "",
  inn: "",
  kpp: "",
  ogrn: "",
  address: "",
  primaryContact: "",
});

const legalForms = ref([
  { label: "ООО", value: "ООО" },
  { label: "ИП", value: "ИП" },
  { label: "АО", value: "АО" },
  { label: "ПАО", value: "ПАО" },
]);

const contacts = ref<PersonContact[]>([]);

onMounted(async () => {
  try {
    contacts.value = await contactService.getAll();
  } catch (err) {
    console.error("Ошибка загрузки контактов:", err);
  }
});

watch(
  () => props.supplier,
  (newSupplier) => {
    if (newSupplier) {
      localSupplier.value = {
        ...newSupplier,
        type: { ...newSupplier.type },
        primaryContact: { ...newSupplier.primaryContact },
      };
    }
  },
  { immediate: true }
);

function validateForm() {
  errors.value = {
    name: "",
    legalForm: "",
    inn: "",
    kpp: "",
    ogrn: "",
    address: "",
    primaryContact: "",
  };
  let isValid = true;

  if (!localSupplier.value.name) {
    errors.value.name = "Название обязательно";
    isValid = false;
  }
  if (!localSupplier.value.legalForm) {
    errors.value.legalForm = "Форма обязательна";
    isValid = false;
  }
  if (!localSupplier.value.inn) {
    errors.value.inn = "ИНН обязателен";
    isValid = false;
  } else if (!/^\d{10,12}$/.test(localSupplier.value.inn)) {
    errors.value.inn = "ИНН должен содержать 10 или 12 цифр";
    isValid = false;
  }
  if (!localSupplier.value.kpp) {
    errors.value.kpp = "КПП обязателен";
    isValid = false;
  } else if (!/^\d{9}$/.test(localSupplier.value.kpp)) {
    errors.value.kpp = "КПП должен содержать 9 цифр";
    isValid = false;
  }
  if (!localSupplier.value.ogrn) {
    errors.value.ogrn = "ОГРН обязателен";
    isValid = false;
  } else if (!/^\d{13,15}$/.test(localSupplier.value.ogrn)) {
    errors.value.ogrn = "ОГРН должен содержать 13 или 15 цифр";
    isValid = false;
  }
  if (!localSupplier.value.address) {
    errors.value.address = "Адрес обязателен";
    isValid = false;
  }
  if (!localSupplier.value.primaryContact.id) {
    errors.value.primaryContact = "Основной контакт обязателен";
    isValid = false;
  }

  return isValid;
}

function handleSave() {
  if (validateForm()) {
    emit("save", { ...localSupplier.value });
  }
}
</script>
