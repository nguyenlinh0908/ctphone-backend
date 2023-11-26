import { DeliveryAddressTypeEnum } from "../enum";

export class CreateDeliveryAddressDto {
  fullName: string;

  provinceId: string;

  province: string;

  districtId: string;

  district: string;

  wardId: string;

  ward: string;

  address: string;

  phone: string;

  isDefault: boolean;

  type:DeliveryAddressTypeEnum
}
