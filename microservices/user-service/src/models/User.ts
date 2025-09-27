import { v4 as uuidv4 } from 'uuid';

export class User {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: Date;

  constructor(email: string, passwordHash: string) {
    this.id = uuidv4();
    this.email = email;
    this.passwordHash = passwordHash;
    this.createdAt = new Date();
  }

  toJSON() {
    return {
      id: this.id,
      email: this.email,
      createdAt: this.createdAt
    };
  }
}
