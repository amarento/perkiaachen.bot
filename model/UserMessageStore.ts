import UserMessage from "./UserMessage";

class UserMessageStore {
  private static instance: UserMessageStore;
  private data: Map<string, UserMessage>;

  private constructor() {
    this.data = new Map<string, UserMessage>();
  }

  public static getInstance(): UserMessageStore {
    if (!UserMessageStore.instance) UserMessageStore.instance = new UserMessageStore();
    return UserMessageStore.instance;
  }

  public set(key: string, value: UserMessage) {
    this.data.set(key, value);
  }

  public get(key: string): UserMessage | undefined {
    return this.data.get(key);
  }

  public getData(): Map<string, UserMessage> {
    return this.data;
  }

  public delete(key: string): void {
    this.data.delete(key);
  }

  public clear(): void {
    this.data.clear();
  }
}

export default UserMessageStore.getInstance();
