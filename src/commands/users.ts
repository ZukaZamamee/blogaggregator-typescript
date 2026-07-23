import { readConfig, setUser } from "../config.js";
import { createUser, getUserByName, getUsers, reset } from "../lib/db/queries/users.js";

export type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;

export async function handlerLogin(cmdName: string, ...args: string[]) {
    if (args.length == 0) {
        throw new Error("missing username")
    }
    const name = args[0]
    const exists = await getUserByName(name)
    if (!exists) {
        throw new Error("Username not registered")
    }
    setUser(name)
    console.log(`User has been set to: ${name}`)
}

export async function handlerRegister(cmdName: string, ...args: string[]) {
    if (args.length == 0) {
        throw new Error("missing username")
    }

    const username = args[0]

    const exists = await getUserByName(username)
    if (exists) {
        throw new Error("Username already exists")
    }

    const result = await createUser(username)
    setUser(result.name)
    console.log(`User ${result.name} created.`)
    console.log(result)
}

export async function handlerReset(cmdName: string, ...args: string[]) {
    try {
        await reset()
    }catch {
        throw new Error("Failure to delete user db")
    }
    console.log("Users table successfully reset")

}

export async function handlerGetUsers(cmdName: string, ...args: string[]) {
    const users = await getUsers()
    const config = readConfig()
    const currentUser = config.currentUserName
    users.forEach(user => {
    const isCurrent = user.name === currentUser;
    const suffix = isCurrent ? ' (current)' : '';
    
    console.log(`* ${user.name}${suffix}`);
    });
}
