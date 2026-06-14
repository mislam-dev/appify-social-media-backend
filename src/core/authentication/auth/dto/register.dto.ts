import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { IsEmailUnique } from 'src/modules/users/decorators/is-email-unique.decorator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @IsString()
  @IsNotEmpty()
  last_name: string;

  @IsEmail()
  @IsNotEmpty()
  @IsEmailUnique()
  email: string;

  // todo: use a validator to validate a real world password
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
