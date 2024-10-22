import {
  IsEmail,
  IsUrl,
  Length,
  Max,
  MaxLength,
  Min,
  MinLength,
  Label,
} from 'ts-dynamic-forms';

export class User {
  @MinLength(1)
  @MaxLength(100)
  @Label('Name')
  firstName: string = '';

  @Length(1, 100)
  @Label('Last Name')
  lastName: string = '';

  @Min(10)
  @Max(100)
  @Label('Age')
  age: number = 10;

  @IsEmail()
  @Label('Email')
  email: string = '';

  @IsUrl()
  @Label('Website URL')
  website: string = '';
}
