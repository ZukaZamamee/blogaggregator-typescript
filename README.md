# Boot.Dev Blog Aggregator in TypeScript 

[Build a Blog Aggregator in TypeScript project](https://www.boot.dev/lessons/4d624835-9830-4ca6-bfbb-280112f64baf) from [Boot.dev](https://www.boot.dev).

## Gator

Gator is a typescript based command-line RSS feed aggregator that allows you to follow and read posts in a command line terminal.

### Prerequisites

Before running Gator, you'll need:

- **Node.js v22.10.1+** - Install via [NVM](https://github.com/nvm-sh/nvm)
- **PostgreSQL 16+** - [Download here](https://www.postgresql.org/download/)
- **npm** - Comes with Node.js

### Installation

1. **Clone the repository**
   ```bash
   https://github.com/ZukaZamamee/blogaggregator-typescript/
   cd gator
   ```

2. **Install Node.js with NVM**
   ```bash
   nvm use
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Set up PostgreSQL**
   
   Start PostgreSQL on Linux:
   ```bash
   sudo service postgresql start
   ```
   
   Create the database on Linux:
   ```bash
   sudo -u postgres psql
   ```
   
   In psql:
   ```sql
   CREATE DATABASE gator;
   \q
   ```

5. **Create the config file**
   
   Create `~/.gatorconfig.json` in your home directory:
   ```json
   {
     "db_url": "postgres://username:password@localhost:5432/gator?sslmode=disable"
   }
   ```
   
   Where `username` and `password` are your PostgreSQL credentials.

6. **Run database migrations**
   ```bash
   npm run generate
   npm run migrate
   ```

### Usage

#### User Management

**Register a new user**
```bash
npm run start register <username>
```

**Login as a user**
```bash
npm run start login <username>
```

**List all users**
```bash
npm run start users
```

#### Feed Management

**Add a new feed**
```bash
npm run start addfeed "<feed-name>" "<feed-url>"
```

Example:
```bash
npm run start addfeed "Hacker News" "https://news.ycombinator.com/rss"
```

**List all feeds**
```bash
npm run start feeds
```

**Follow a feed**
```bash
npm run start follow "<feed-url>"
```

**Unfollow a feed**
```bash
npm run start unfollow "<feed-url>"
```

**List feeds you're following**
```bash
npm run start following
```

#### Reading Posts

**Browse posts from feeds you follow. Limit is optional**
```bash
npm run start browse [limit]
```

Examples:
```bash
npm run start browse
npm run start browse 10
```

#### Feed Aggregation

**Run the aggregator (background service)**
```bash
npm run start agg <time-between-requests>
```

The aggregator continuously fetches new posts from all feeds in the database.

Time format examples:
- `1s` - every second
- `30s` - every 30 seconds
- `1m` - every minute
- `5m` - every 5 minutes
- `1h` - every hour

Example:
```bash
npm run start agg 1m
```

Press `Ctrl+C` to stop the aggregator.

**Note:** Be respectful of servers - don't overwhelm them with requests by setting the interval too low. A reasonably time frame is 5-10 minutes.

#### Utility Commands

**Reset the database**
```bash
npm run start reset
```

This deletes all users, feeds, and posts.