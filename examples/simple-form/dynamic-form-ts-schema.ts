import { FieldNumber, FieldString } from '../../packages/core/types';

type Post = {
  title: string;
  content: string;
};

type Phone = {
  num: string;
  type: 'home' | 'work';
};

enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

type User = {
  firstname: FieldString<1, 50, '[a-zA-Z]+$', 'Incorrect name', 'First Name'>;
  lastname: FieldString<1, 50, '[a-zA-Z]+$', 'Incorrect name', 'Last Name'>;
  age: FieldNumber<1, 100, ''>;
  sex: string;
  job: string;
  posts: Post[];
  address: {
    street: string;
    city: string;
    zip: string;
  }[];
  role: UserRole;
  // Test inline object
  phones: { num: string; type: 'home' | 'work' }[];
  phone: Phone;
};

// Alternatively, you can use the class syntax
class PhoneForm {
  num: string = '';
  type: 'home' | 'work' = 'home';
}

class UserForm {
  firstname: string = '';
  lastname: string = '';
  age: number = 0;
  phone: PhoneForm = new PhoneForm();
}
