import { IsNumber, Min } from 'class-validator';

export class PaginateFilter {
  @IsNumber()
  @Min(1)
  limit: number;

  @IsNumber()
  @Min(1)
  page: number;
}
