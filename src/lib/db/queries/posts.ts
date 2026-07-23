import { db } from "../index.js";
import { feeds, feedFollows, posts } from "../schema.js";
import { eq, desc } from "drizzle-orm";

export async function createPost(title: string, url: string, feedId: string, description?: string, publishedAt?: Date) {
    const [result] = await db.insert(posts)
        .values({ title: title, url: url, description: description, publishedAt: publishedAt, feedId: feedId})
        .returning();
    return result;
}

export async function getPostsForUsers(userId: string, numPosts: number) {
    const results = await db.select()
    .from(posts)
    .innerJoin(feeds, eq(posts.feedId, feeds.id))
    .innerJoin(feedFollows, eq(feeds.id, feedFollows.feedId))
    .where(eq(feedFollows.userId, userId))
    .orderBy(desc(posts.publishedAt))
    .limit(numPosts)
    return results
}