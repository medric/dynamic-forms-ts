import { Length } from '~core/types';

class MyType {
  @Length(10, 20)
  property1: string = '';
}

enum MyEnum {
  VALUE1,
  VALUE2,
}
