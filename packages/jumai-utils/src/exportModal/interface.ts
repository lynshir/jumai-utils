export interface Template {
  id: number;
  templateName: string;
  fields: Fields[];
  tenantId?: number;
}

export interface Fields {
  baseSerializeSchemaName: string;
  id: string;
}
