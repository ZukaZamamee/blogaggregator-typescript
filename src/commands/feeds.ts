import { XMLParser } from "fast-xml-parser";
import { readConfig } from "../config.js";
import { createFeed, createFeedFollow, deleteFeedFollow, feedByUrl, getFeedFollowsForUser, getFeeds, getNextFeedToFetch, markFeedFetched } from "../lib/db/queries/feeds.js";
import { getNameByUserId, getUserByName } from "../lib/db/queries/users.js";
import { Feed, User } from "../lib/db/schema.js";
import { parseDuration } from "./time.js";
import { getPostsForUsers } from "../lib/db/queries/posts.js";

export async function fetchFeed(feedURL: string) {
    const response = await fetch(feedURL, {headers: {"User-Agent": "gator",},});
    const xmlString = await response.text()

    const parser = new XMLParser({processEntities: false,});
    let jObj = parser.parse(xmlString);

    const channel = jObj.rss?.channel
    if (!channel || typeof channel !== "object") {
        throw new Error("invalid xml")
    }

    if (!channel.title || typeof channel.title  !== "string") {
        throw new Error("invalid xml")
    }
    if (!channel.link || typeof channel.link  !== "string") {
        throw new Error("invalid xml")
    }
    if (!channel.description || typeof channel.description  !== "string") {
        throw new Error("invalid xml")
    }

    let entries = [];

    if (Array.isArray(channel.item)) {
    entries = channel.item;
    } else if (channel.item && typeof channel.item === "object") {
    entries = [channel.item];
    }

    const items = [];

    for (let entry of entries) {
        if (!entry.title || typeof entry.title  !== "string") {
            continue;
        }
        if (!entry.link || typeof entry.link  !== "string") {
            continue;
        }
        if (!entry.description || typeof entry.description  !== "string") {
            continue;
        }
        if (!entry.pubDate || typeof entry.pubDate  !== "string") {
            continue;
        }
        
        items.push({
            title: entry.title,
            link: entry.link,
            description: entry.description,
            pubDate: entry.pubDate,
        });
    }
    return {
        channel: {
            title: channel.title,
            link: channel.link,
            description: channel.description,
            item: items
        }
    }
}

export async function addfeed(name: string, user: User, url: string) {

    const feed = await createFeed(name, url, user.id)
    const follow = await createFeedFollow(feed.id, user.id)
    console.log(`Feed Name: ${follow.feedName}`)
    console.log(`User Name: ${follow.userName}`)
}

export function printFeed(feed: Feed, user: User) {
    console.log(`* Feed Id: ${feed.id}`)
    console.log(`* Feed Created At: ${feed.createdAt}`)
    console.log(`* Feed Updated At: ${feed.updatedAt}`)
    console.log(`* Feed Name: ${feed.name}`)
    console.log(`* Feed URL: ${feed.url}`)
    console.log(`* User Id: ${feed.userId}`)
    console.log(`* User Name: ${user.name}`)
}

export async function handlerAddFeed(cmdName: string, user: User, ...args: string[]) {
    if (args.length < 2) {
        throw new Error("missing feed name or url")
    }

    const feedName = args[0]
    const feedURL = args[1] 
    await addfeed(feedName, user, feedURL);
}

export async function handlerGetFeeds(cmdName: string, ...args: string[]) {
    const feeds = await getFeeds()
    if (feeds.length == 0) {
        console.log("no feeds registered")
        return;
    }
    console.log(`Feeds:`)
    for (let feed of feeds) {
        let userName = await getNameByUserId(feed.userId)
        console.log(`Name: ${feed.name}`)
        console.log(`URL: ${feed.url}`)
        console.log(`Feed Created By: ${userName}`)
    }
}

export async function handlerFollow(cmdName: string, user: User, ...args: string[]) {
    if (args.length == 0) {
        throw new Error("missing feed url")
    }
    const feedURL = args[0]
    const feed = await feedByUrl(feedURL)
    if (!feed) {
        throw new Error("feed not found");
    }

    const follow = await createFeedFollow(feed.id, user.id)
    console.log(`Feed Name: ${follow.feedName}`)
    console.log(`User Name: ${user.name}`)
}

export async function handlerFollowing(cmdName: string, user: User, ...args: string[]) {
    const follows = await getFeedFollowsForUser(user.id)
    console.log(`Feeds followed by ${user.name}:`)
    for (let feed of follows) {
        console.log(` * Name: ${feed.feedName}`)
    }
}

export async function handlerUnfollow(cmdName: string, user: User, ...args: string[]) {
    if (args.length == 0) {
        throw new Error("missing feed url")
    }
    const feedURL = args[0]
    const feed = await feedByUrl(feedURL)
    if (!feed) {
        throw new Error("feed not found");
    }

    await deleteFeedFollow(user.id, feed.id)
}

export async function handlerBrowse(
  cmdName: string,
  user: User,
  ...args: string[]
) {
  let limit = 2;
  if (args.length === 1) {
    let specifiedLimit = parseInt(args[0]);
    if (specifiedLimit) {
      limit = specifiedLimit;
    } else {
      throw new Error(`usage: ${cmdName} [limit]`);
    }
  }

  const posts = await getPostsForUsers(user.id, limit);

  console.log(`Found ${posts.length} posts for user ${user.name}`);
  for (let post of posts) {
    console.log(`${post.posts.publishedAt} from ${post.feeds.name}`);
    console.log(`--- ${post.posts.title} ---`);
    console.log(`    ${post.posts.description}`);
    console.log(`Link: ${post.posts.url}`);
    console.log(`=====================================`);
  }
}