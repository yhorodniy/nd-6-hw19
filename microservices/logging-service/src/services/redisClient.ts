import { createClient, RedisClientType } from 'redis';

class RedisClient {
  private subscriber: RedisClientType;

  constructor() {
    this.subscriber = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    this.subscriber.on('error', (err: any) => console.error('Redis Subscriber Error:', err));
  }

  async connect() {
    await this.subscriber.connect();
  }

  async subscribe(channel: string, callback: (message: string) => void) {
    await this.subscriber.subscribe(channel, callback);
  }

  async disconnect() {
    await this.subscriber.disconnect();
  }
}

export const redisClient = new RedisClient();
