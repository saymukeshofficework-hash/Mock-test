export interface SchoolSettings {
  school_name: string
  education_center: string
  district: string
  state: string
  block: string
  udise_code: string
  mobile: string
  email: string
  address: string
  principal_name: string
  teacher_name: string
  logo_url?: string
  govt_logo_url?: string
  date_format: 'DD/MM/YYYY' | 'DD-MM-YYYY' | 'DD.MM.YYYY'
  default_place: string
}

export const DEFAULT_SCHOOL_SETTINGS: SchoolSettings = {
  school_name: 'शासकीय प्राथमिक शाला भरमीला',
  education_center: 'बिजौरी',
  district: 'उमरिया',
  state: 'मध्य प्रदेश',
  block: 'मानपुर',
  udise_code: '',
  mobile: '',
  email: '',
  address: '',
  principal_name: '',
  teacher_name: '',
  logo_url: '',
  govt_logo_url: '',
  date_format: 'DD/MM/YYYY',
  default_place: 'भरमीला',
}
