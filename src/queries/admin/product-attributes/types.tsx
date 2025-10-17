export interface ProductAttributeValue {
  id: string;
  value: string;
}

export interface ProductAttribute {
  id: string;
  name: string;
  values: ProductAttributeValue[];
}
