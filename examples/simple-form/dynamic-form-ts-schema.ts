import type {
  NumberField,
  StringField,
  StructField,
} from '../../packages/core/types';

type Post = {
  title: string;
  content: string;
};

type Phone = {
  num: string;
  type: 'home' | 'work';
};

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export type Address = {
  street: StringField<1, 50, '', 'Please enter a valid street', 'Street'>;
  city: StringField<1, 50, '', 'Please enter a valid city', 'City'>;
  zip: StringField<1, 50, '', 'Please enter a valid zip code', 'Zip'>;
};

export type User = {
  firstname: StringField<
    1,
    50,
    '[a-zA-Z]+$',
    'Please enter a correct name',
    'First Name'
  >;
  lastname: StringField<
    1,
    50,
    '[a-zA-Z]+$',
    'Please enter a correct name',
    'Last Name'
  >;
  age: NumberField<1, 100, 'Please enter a valid age', 'Age'>;
  sex: StringField<1, 10, '', 'Please enter a valid value', 'Sex'>;
  job: StringField<1, 10, '', 'Please enter a valid value', 'Job'>;
  address: Address;
  role: UserRole;
  phone: Phone;
};
