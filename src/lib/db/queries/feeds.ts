import { db } from "../index.js";
import { feeds, feedFollows, users } from "../schema.js";
import { eq, and, sql } from "drizzle-orm";

export async function createFeed(name: string, url: string, userId: string) {
    const [result] = await db.insert(feeds)
        .values({ name: name, url: url, userId: userId})
        .returning();
    return result;
}

export async function getFeeds() {
    const result = await db
        .select().from(feeds)
        .orderBy(feeds.createdAt)
    return result;
}

export async function createFeedFollow(feedId: string, userId: string) {
    const [newFeedFollow] = await db.insert(feedFollows)
        .values({feedId, userId})
        .returning()
    
    const [follow] = await db.select({
        id: feedFollows.id,
        createdAt: feedFollows.createdAt,
        updatedAt: feedFollows.updatedAt,
        feedId: feedFollows.feedId,
        userId: feedFollows.userId,
        feedName: feeds.name,
        userName: users.name
    })
        .from(feedFollows)
        .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
        .innerJoin(users, eq(feedFollows.userId, users.id))
        .where(eq(feedFollows.id, newFeedFollow.id))
    
    return follow
}

export async function feedByUrl(feedUrl: string) {
    const[result] = await db.select()
        .from(feeds)
        .where(eq(feeds.url, feedUrl))
    return result
}

export async function getFeedFollowsForUser(userId: string) {
    const results = await db.select({
        id: feedFollows.id,
        createdAt: feedFollows.createdAt,
        updatedAt: feedFollows.updatedAt,
        feedId: feedFollows.feedId,
        userId: feedFollows.userId,
        feedName: feeds.name,
        userName: users.name
    })
        .from(feedFollows)
        .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
        .innerJoin(users, eq(feedFollows.userId, users.id))
        .where(eq(feedFollows.userId, userId))
    return results;
}

export async function deleteFeedFollow(userId: string, feedId: string) {
    const [result] = await db.delete(feedFollows)
    .where(
        and(
            eq(feedFollows.userId, userId),
            eq(feedFollows.feedId, feedId)
        )
    )
    .returning()
    return result
}

export async function markFeedFetched(feedId: string) {
    const [result] = await db.update(feeds)
        .set({updatedAt: new Date(), lastFetchedAt: new Date()})
        .where(eq(feeds.id, feedId))
        .returning()
    return result
}

export async function getNextFeedToFetch() {
    const [result] = await db
        .select()
        .from(feeds)
        .orderBy(sql`${feeds.lastFetchedAt} asc nulls first`)
        .limit(1)
    return result
}