import { readConfig } from "../config.js";
import { getUserByName } from "../lib/db/queries/users.js";
import { User } from "../lib/db/schema.js";
import { CommandHandler } from "./users.js";

type UserCommandHandler = (
  cmdName: string,
  user: User,
  ...args: string[]
) => Promise<void>;

type middlewareLoggedIn = (handler: UserCommandHandler) => CommandHandler;
0
export function middlewareLoggedIn(handler: UserCommandHandler): CommandHandler {
  return async (cmdName: string, ...args: string[]) => {
    const config = readConfig()
    const currentUser = config.currentUserName
    const user = await getUserByName(currentUser)
    if (!user) {
        throw new Error("invalid user")
    }
    await handler(cmdName, user, ...args)
  };
}
