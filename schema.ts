

type Post = {
  title: string;
  content: string;
}

enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

type User = {
  firstame: string;
  lastname: string;
  age: number;
  posts: Post[] | { 
    _df: 'disabled'
  }
  address: {
    street: string;
    city: string;
    zip: number;
  }[];
  role: UserRole;
  phones: { num: string; type: 'home' | 'work' }[];
}
