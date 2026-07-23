import { registerCommand, runCommand } from "./commands/commands.js";
import { handlerGetUsers, handlerLogin, handlerRegister, handlerReset } from "./commands/users.js";
import { CommandsRegistry } from "./commands/commands.js";
import { handlerAddFeed, handlerGetFeeds, handlerFollow, handlerFollowing, handlerUnfollow, handlerBrowse } from "./commands/feeds.js";
import { middlewareLoggedIn } from "./commands/middleware.js";
import { handlerAgg } from "./commands/aggregate.js";

async function main() {
  const registry: CommandsRegistry = {};
  registerCommand(registry, "login", handlerLogin)
  registerCommand(registry, "register", handlerRegister)
  registerCommand(registry, "reset", handlerReset)
  registerCommand(registry, "users", handlerGetUsers)
  registerCommand(registry, "agg", handlerAgg)
  registerCommand(registry, "addfeed", middlewareLoggedIn(handlerAddFeed))
  registerCommand(registry, "feeds", handlerGetFeeds)
  registerCommand(registry, "follow", middlewareLoggedIn(handlerFollow))
  registerCommand(registry, "following", middlewareLoggedIn(handlerFollowing))
  registerCommand(registry, "unfollow", middlewareLoggedIn(handlerUnfollow))
  registerCommand(registry, "browse", middlewareLoggedIn(handlerBrowse))
  const rawArgs = process.argv.slice(2)
  if (rawArgs.length < 1) {
    console.error("not enough arguments")
    process.exit(1)
  }

  const cmdName = rawArgs[0]
  const args = rawArgs.slice(1)

  try {
    await runCommand(registry, cmdName, ...args)
  } catch (err) {
    console.log(err)
    process.exit(1)
  }
  process.exit(0)
}

main();