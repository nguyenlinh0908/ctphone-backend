import { IsNumberString } from 'class-validator';

export class PaginateFilter {
  @IsNumberString()
  limit: number = 13;

  @IsNumberString()
  page: number = 0;
}
