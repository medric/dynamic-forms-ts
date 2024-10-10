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
  firstame: string;
  lastname: string;
  age: number;
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
