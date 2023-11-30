import { IDistrict } from './district.interface';

export interface IProvince {
  name: string;
  code: number;
  division_type: string;
  codename: string;
  phone_code: 24;
  districts: IDistrict[];
}
