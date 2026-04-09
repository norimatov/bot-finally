import { IsString, Matches, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class AddCarDto {
  @IsString()
  @Matches(/^[0-9]{2}[A-Z]{1}[0-9]{3}[A-Z]{2}$/i, { message: 'Notog\'ri avtomobil raqami' })
  plate_number: string;

  @IsString()
  @Matches(/^998[0-9]{9}$/, { message: 'Notog\'ri telefon raqami' })
  phone: string;

  @IsDate()
  @Type(() => Date)
  end_date: Date;
}
