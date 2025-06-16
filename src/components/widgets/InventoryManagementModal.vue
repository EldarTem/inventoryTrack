<template>
  <Dialog
    :visible="visible"
    :header="headerText"
    modal
    @update:visible="onCancel"
    style="width: 50vw"
  >
    <form class="form-container" @submit.prevent="onSave">
      <div class="fields-section">
        <div class="field">
          <label for="number">Номер</label>
          <InputText
            id="number"
            v-model="localInventory.number"
            :class="{ 'p-invalid': errors.inventory.number }"
            autocomplete="off"
          />
          <small v-if="errors.inventory.number" class="p-error">{{
            errors.inventory.number
          }}</small>
        </div>
        <div class="field">
          <label for="status">Статус</label>
          <Dropdown
            id="status"
            v-model="localInventory.status.code"
            :options="inventoryStatuses"
            optionLabel="displayValue"
            optionValue="code"
            placeholder="Выберите статус"
          />
        </div>
        <div class="field">
          <label for="warehouse">Склад</label>
          <Dropdown
            id="warehouse"
            :model-value="localInventory.warehouse.id"
            :options="warehouses"
            optionLabel="displayValue"
            optionValue="id"
            placeholder="Выберите склад"
            :class="{ 'p-invalid': errors.inventory.warehouse }"
            @update:model-value="updateWarehouse"
          />
          <small v-if="errors.inventory.warehouse" class="p-error">{{
            errors.inventory.warehouse
          }}</small>
        </div>
        <div class="field">
          <label for="createdBy">Создал</label>
          <Dropdown
            id="createdBy"
            :model-value="localInventory.createdBy.id"
            :options="users"
            optionLabel="displayValue"
            optionValue="id"
            placeholder="Выберите пользователя"
            :class="{ 'p-invalid': errors.inventory.createdBy }"
            @update:model-value="updateCreatedBy"
          />
          <small v-if="errors.inventory.createdBy" class="p-error">{{
            errors.inventory.createdBy
          }}</small>
        </div>
        <div class="field">
          <label for="comment">Комментарий</label>
          <Textarea id="comment" v-model="localInventory.comment" rows="2" />
        </div>
      </div>

      <div class="items-section">
        <h4>Товары инвентаризации</h4>
        <table class="inventory-items-table">
          <thead>
            <tr>
              <th style="width: 2rem">Товар</th>
              <th style="width: 2rem">Ожидаемое кол-во</th>
              <th style="width: 2rem">Фактическое кол-во</th>
              <th style="width: 2rem">Секция</th>
              <th style="width: 2rem"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in localInventoryItems" :key="index">
              <td>
                <Dropdown
                  v-model="item.productId"
                  :options="products"
                  optionLabel="name"
                  optionValue="id"
                  placeholder="Товар"
                  filter
                  :class="{
                    'p-invalid': errors.inventoryItems[index]?.productId,
                  }"
                  @update:model-value="updateProductSection(index, $event)"
                />
                <small
                  v-if="errors.inventoryItems[index]?.productId"
                  class="p-error"
                >
                  {{ errors.inventoryItems[index]?.productId }}
                </small>
              </td>
              <td>
                <InputNumber
                  v-model="item.expectedQuantity"
                  :min="0"
                  :class="{
                    'p-invalid': errors.inventoryItems[index]?.expectedQuantity,
                  }"
                />
                <small
                  v-if="errors.inventoryItems[index]?.expectedQuantity"
                  class="p-error"
                >
                  {{ errors.inventoryItems[index]?.expectedQuantity }}
                </small>
              </td>
              <td>
                <InputNumber
                  v-model="item.actualQuantity"
                  :min="0"
                  :class="{
                    'p-invalid': errors.inventoryItems[index]?.actualQuantity,
                  }"
                />
                <small
                  v-if="errors.inventoryItems[index]?.actualQuantity"
                  class="p-error"
                >
                  {{ errors.inventoryItems[index]?.actualQuantity }}
                </small>
              </td>
              <td>
                <Dropdown
                  v-model="item.sectionId"
                  :options="sections"
                  optionLabel="code"
                  optionValue="id"
                  placeholder="Секция"
                  :class="{
                    'p-invalid': errors.inventoryItems[index]?.sectionId,
                  }"
                  @update:model-value="updateSection(index, $event)"
                />
                <small
                  v-if="errors.inventoryItems[index]?.sectionId"
                  class="p-error"
                >
                  {{ errors.inventoryItems[index]?.sectionId }}
                </small>
              </td>
              <td>
                <Button
                  icon="pi pi-trash"
                  severity="danger"
                  text
                  class="p-button-sm"
                  @click="removeInventoryItem(index)"
                />
              </td>
            </tr>
          </tbody>
        </table>
        <Button
          class="mt-2"
          label="Добавить товар"
          icon="pi pi-plus"
          @click="addInventoryItem"
        />
        <div v-if="!localInventoryItems.length" class="no-data">
          <p>Нет добавленных товаров</p>
        </div>
      </div>

      <div class="footer-buttons">
        <Button label="Сохранить" icon="pi pi-check" type="submit" />
        <Button label="Отмена" icon="pi pi-times" text @click="onCancel" />
      </div>
    </form>
  </Dialog>
</template>

<script lang="ts" setup>
import { ref, watch, computed, onMounted } from "vue";
import { useWarehouseStore } from "@/stores/warehouseStore";
import { useProductStore } from "@/stores/productStore";
import { useInventoryItemStore } from "@/stores/inventoryItemStore";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Dropdown from "primevue/dropdown";
import Textarea from "primevue/textarea";
import InputNumber from "primevue/inputnumber";
import Button from "primevue/button";
import { useToast } from "primevue/usetoast";
import type { Inventory, InventoryItem, Warehouse } from "@/types/models";
import { v4 as uuidv4 } from "uuid";

const props = defineProps<{
  visible: boolean;
  inventory: Inventory | null;
  inventoryItem?: InventoryItem | null;
  isEdit: boolean;
}>();

const emit = defineEmits<{
  (
    e: "save",
    payload: { inventory: Inventory; inventoryItems: InventoryItem[] }
  ): void;
  (e: "cancel"): void;
}>();

const warehouseStore = useWarehouseStore();
const productStore = useProductStore();
const inventoryItemStore = useInventoryItemStore();
const toast = useToast();

const localInventory = ref<Inventory>({
  id: "",
  number: "",
  status: { code: "draft", displayValue: "Черновик" },
  warehouse: { id: "", displayValue: "" },
  createdBy: { id: "", displayValue: "" },
  comment: "",
  createdAt: new Date().toISOString(),
});
const localInventoryItems = ref<InventoryItem[]>([]);
const errors = ref({
  inventory: { number: "", warehouse: "", createdBy: "" },
  inventoryItems: [] as {
    productId?: string;
    expectedQuantity?: string;
    actualQuantity?: string;
    sectionId?: string;
  }[],
});

const inventoryStatuses = [
  { code: "draft", displayValue: "Черновик" },
  { code: "completed", displayValue: "Завершено" },
];
const warehouses = computed(() =>
  warehouseStore.warehouses.map((w: Warehouse) => ({
    id: w.id,
    displayValue: w.name,
  }))
);
const users = ref([
  { id: "user1", displayValue: "Пользователь 1" },
  { id: "user2", displayValue: "Пользователь 2" },
]);
const products = computed(() => productStore.products);
const sections = computed(() => warehouseStore.sections);

const inventoryId = computed(() => localInventory.value.id || null);
const headerText = computed(() =>
  props.isEdit ? "Редактировать инвентаризацию" : "Создать инвентаризацию"
);

onMounted(async () => {
  await Promise.all([
    warehouseStore.fetchAll(),
    warehouseStore.fetchAllSections(),
    productStore.fetchAll(),
  ]);
  if (props.isEdit && props.inventory && props.inventory.id) {
    await inventoryItemStore.fetchAllByInventory(props.inventory.id);
    localInventoryItems.value = [...inventoryItemStore.inventoryItems];
  }
});

watch(
  () => props.inventory,
  (newInventory) => {
    if (newInventory) {
      localInventory.value = { ...newInventory };
      if (newInventory.id) {
        localInventoryItems.value = localInventoryItems.value.map((item) => ({
          ...item,
          inventoryId: newInventory.id,
        }));
      }
    }
  },
  { immediate: true }
);

watch(
  () => props.inventoryItem,
  (newInventoryItem) => {
    if (newInventoryItem) {
      localInventoryItems.value = [{ ...newInventoryItem }];
    } else {
      localInventoryItems.value = [];
    }
  },
  { immediate: true }
);

function updateProductSection(index: number, productId: string) {
  const product = products.value.find((p) => p.id === productId);
  if (product) {
    localInventoryItems.value[index].productName = product.name;
    if (product.sectionId) {
      localInventoryItems.value[index].sectionId = product.sectionId;
      const section = sections.value.find((s) => s.id === product.sectionId);
      localInventoryItems.value[index].sectionName = section?.code || "";
    }
  }
}

function updateSection(index: number, sectionId: string) {
  const section = sections.value.find((s) => s.id === sectionId);
  if (section) {
    localInventoryItems.value[index].sectionName = section.code;
  }
}

function updateWarehouse(newValue: string) {
  const warehouse = warehouses.value.find(
    (w: { id: string; displayValue: string }) => w.id === newValue
  );
  localInventory.value.warehouse = {
    id: newValue,
    displayValue: warehouse?.displayValue || "",
  };
}

function updateCreatedBy(newValue: string) {
  const user = users.value.find((u) => u.id === newValue);
  localInventory.value.createdBy = {
    id: newValue,
    displayValue: user?.displayValue || "",
  };
}

function addInventoryItem() {
  localInventoryItems.value.push({
    id: uuidv4(),
    productId: "",
    inventoryId: inventoryId.value || "",
    expectedQuantity: 0,
    actualQuantity: 0,
    sectionId: "",
    productName: "",
    sectionName: "",
  });
  errors.value.inventoryItems.push({});
}

function removeInventoryItem(index: number) {
  localInventoryItems.value.splice(index, 1);
  errors.value.inventoryItems.splice(index, 1);
}

function validateInventory(): boolean {
  errors.value.inventory = { number: "", warehouse: "", createdBy: "" };
  let isValid = true;
  if (!localInventory.value.number) {
    errors.value.inventory.number = "Номер обязателен";
    isValid = false;
  }
  if (!localInventory.value.warehouse.id) {
    errors.value.inventory.warehouse = "Склад обязателен";
    isValid = false;
  }
  if (!localInventory.value.createdBy.id) {
    errors.value.inventory.createdBy = "Пользователь обязателен";
    isValid = false;
  }
  return isValid;
}

function validateInventoryItems(): boolean {
  errors.value.inventoryItems = localInventoryItems.value.map(() => ({}));
  let isValid = true;
  localInventoryItems.value.forEach((item, index) => {
    if (!item.productId) {
      errors.value.inventoryItems[index].productId = "Товар обязателен";
      isValid = false;
    }
    if (item.expectedQuantity < 0) {
      errors.value.inventoryItems[index].expectedQuantity =
        "Ожидаемое количество не может быть отрицательным";
      isValid = false;
    }
    if (item.actualQuantity < 0) {
      errors.value.inventoryItems[index].actualQuantity =
        "Фактическое количество не может быть отрицательным";
      isValid = false;
    }
    if (!item.sectionId) {
      errors.value.inventoryItems[index].sectionId = "Секция обязательна";
      isValid = false;
    }
  });
  return isValid;
}

function onSave() {
  const isInventoryValid = validateInventory();
  const isInventoryItemsValid = localInventoryItems.value.length
    ? validateInventoryItems()
    : true;
  if (isInventoryValid && isInventoryItemsValid) {
    emit("save", {
      inventory: localInventory.value,
      inventoryItems: localInventoryItems.value,
    });
  } else {
    toast.add({
      severity: "error",
      summary: "Исправьте ошибки формы",
      life: 3000,
    });
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
  gap: 28px;
}
.fields-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px 36px;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.items-section {
  margin-top: 14px;
}
.inventory-items-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 12px;
}
.inventory-items-table th,
.inventory-items-table td {
  border: 1px solid #eee;
  padding: 8px;
  text-align: left;
}
.inventory-items-table th {
  background: #f7f7f7;
}
.p-error {
  color: #e53935;
  font-size: 13px;
}
.no-data {
  text-align: center;
  color: #666;
  margin: 16px;
}
.footer-buttons {
  margin-top: 16px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}
</style>
