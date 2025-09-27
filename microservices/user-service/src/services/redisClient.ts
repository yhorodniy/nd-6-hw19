import { createClient, RedisClientType } from 'redis';

class RedisClient {
  private client: RedisClientType;
  private subscriber: RedisClientType;

  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    this.subscriber = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    this.client.on('error', (err) => console.error('Redis Client Error:', err));
    this.subscriber.on('error', (err) => console.error('Redis Subscriber Error:', err));
  }

  async connect() {
    await this.client.connect();
    await this.subscriber.connect();
  }

  async set(key: string, value: string, expiration?: number) {
    if (expiration) {
      return await this.client.setEx(key, expiration, value);
    }
    return await this.client.set(key, value);
  }

  async get(key: string) {
    return await this.client.get(key);
  }

  async publish(channel: string, message: string) {
    return await this.client.publish(channel, message);
  }

  async subscribe(channel: string, callback: (message: string) => void) {
    await this.subscriber.subscribe(channel, callback);
  }

  async disconnect() {
    await this.client.disconnect();
    await this.subscriber.disconnect();
  }
}

export const redisClient = new RedisClient();
