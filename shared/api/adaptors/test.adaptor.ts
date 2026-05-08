import { localDB } from "@shared/api/local/db";
import { User } from "@shared/api/local/schemas";

export class TestAdaptor {
  static async getAllExistingUsers(): Promise<void> {
    const existingUsers = await localDB.select().from(User);
    console.log("existingUser:", existingUsers);
  }
}
