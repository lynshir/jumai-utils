
export interface Option {
  value: string;
  label: string;
  children?: Option[];
  isLeaf?: boolean;
  loading?: boolean;
}

export interface Province {
  id: number;
  provinceName: string;
}

export interface City {
  id: number;
  cityName: string;
}

export interface District {
  id: number;
  districtName: string;
}

export interface ParsingAddress {
  city: string;
  cityId: string;
  detail: string;
  district: string;
  districtId: string;
  name: string;
  phone: string;
  province: string;
  provinceId: string;
}
