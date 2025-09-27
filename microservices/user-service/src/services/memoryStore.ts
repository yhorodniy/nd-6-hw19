import { User } from '../models/User';

// Простий in-memory store для розробки/тестування
class InMemoryStore {
  private users: Map<string, User> = new Map();
  private emailToId: Map<string, string> = new Map();
  private subscribers: Map<string, Array<(message: string) => void>> = new Map();

  async set(key: string, value: string) {
    if (key.startsWith('user:email:')) {
      const email = key.replace('user:email:', '');
      this.emailToId.set(email, value);
    } else if (key.startsWith('user:')) {
      const user = JSON.parse(value);
      this.users.set(key, user);
    }
  }

  async get(key: string): Promise<string | null> {
    if (key.startsWith('user:email:')) {
      const email = key.replace('user:email:', '');
      return this.emailToId.get(email) || null;
    } else if (key.startsWith('user:')) {
      const user = this.users.get(key);
      return user ? JSON.stringify(user) : null;
    }
    return null;
  }

  async publish(channel: string, message: string) {
    const channelSubscribers = this.subscribers.get(channel) || [];
    channelSubscribers.forEach(callback => {
      try {
        callback(message);
      } catch (error) {
        console.error('Error in subscriber callback:', error);
      }
    });
  }

  async subscribe(channel: string, callback: (message: string) => void) {
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, []);
    }
    this.subscribers.get(channel)!.push(callback);
  }

  async connect() {
    console.log('Connected to in-memory store (Redis not available)');
  }

  async disconnect() {
    console.log('Disconnected from in-memory store');
  }
}

export const memoryStore = new InMemoryStore();
