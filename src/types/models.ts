export interface Role {
  code: string
  displayValue: string
}

export interface Contact {
  id: string
  displayValue: string
}

export interface PersonContact {
  id: string
  fullName: string
  position: string
  phone: string
  email: string
  organization?: {
    id: string
    displayValue: string
  }
}

export interface User {
  id: string
  login: string
  isActive?: boolean
  role: Role
  contact?: Contact
  password?: string
}

export interface OrderItem {
  quantity: number
  price: number
  productId: string
  productName?: string
  orderId: string
  orderName?: string
  sectionId: string
  sectionName?: string
}

export interface Order {
  id: string
  number: string
  approvedAt?: string
  type: OrderType
  status: OrderStatus
  warehouseId: string
  warehouseName?: string
  organizationId: string
  organizationName?: string
  contactId: string
  contactName?: string
  comment?: string
}

export enum OrderType {
  Incoming = 0,
  Outgoing = 1,
}

export enum OrderStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
}

export interface OrganizationType {
  code: string
  displayValue: string
}

export interface Organization {
  id: string
  name: string
  legalForm: string
  inn: string
  kpp: string
  ogrn: string
  address: string
  phone: string
  email: string
  type: OrganizationType
  primaryContact: Contact
}

export interface ProductCategory {
  id: string
  name: string
  description: string
}

export interface Product {
  id: string
  name: string
  code: string
  barcode: string
  description: string
  quantity: number
  price: number
  unit: ProductUnit
  categoryId: string
  sectionId: string
  supplierId: string
}

export enum ProductUnit {
  Piece = 0,
  Kilogram = 1,
  Liter = 2,
}

export interface Warehouse {
  id: string
  name: string
  address: string
  description: string
  owner: {
    id: string
    displayValue: string
  }
}

export interface WarehouseSection {
  id: string
  code: string
  description: string
  warehouse: {
    id: string
    displayValue: string
  }
}
