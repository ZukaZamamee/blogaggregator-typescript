import { db } from "../index.js";
import { users } from "../schema.js";
import { eq } from "drizzle-orm";

export async function createUser(name: string) {
  const [result] = await db.insert(users).values({ name: name }).returning();
  return result;
}

export async function getUserByName(name: string) {
    const result = await db
        .select().from(users)
        .where(eq(users.name, name));
    if (result.length === 0) {
        return null
    }
    return result[0]
}

export async function reset() {
  await db.delete(users)
}

export async function getUsers() {
  const result = await db
      .select().from(users)
  return result;
}

export async function getNameByUserId(userId: string) {
    const result = await db
        .select().from(users)
        .where(eq(users.id, userId));
    if (result.length === 0) {
        return null
    }
    return result[0].name
}