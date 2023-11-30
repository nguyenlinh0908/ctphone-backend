import { IWard } from "./ward.interface";

export interface IDistrict {
  name: string;
  code: number;
  division_type: string;
  codename: string;
  province_code: number;
  wards: IWard[];
}
