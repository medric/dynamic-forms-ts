import {
  IsEmail,
  IsUrl,
  Length,
  Max,
  MaxLength,
  Min,
  MinLength,
  Label,
} from 'dynamic-forms-ts';

class User {
  @MinLength(1)
  @MaxLength(100)
  @Label('Name')
  firstName: string = '';

  @Length(1, 100)
  lastName: string = '';

  @Min(10)
  @Max(100)
  age: number = 10;

  @IsEmail()
  email: string = '';

  @IsUrl()
  @Label('Website URL')
  website: string = '';
}
