DynamoDB-migrations
-------------------

Create and run DynamoDB migrations easily.

Install with `npm i -D dynamo-migrator`

Add a `create` and a `migrate` script in your `package.json` file:

```json
    {
        "scripts": {
            "create": "dynamo-migrator create",
            "migrate": "dynamo-migrator migrate"
        }
    }
```

---

`MIGRATION_TABLE`: Table name to keep migrations run. Defaults to `_migrations`.

`MIGRATION_ATTRIBUTE`: Table migration attribute. Defaults to `migration_date`.

`MIGRATION_DIR`: Directory name that holds all migration files. Defaults to `migrations`.

`DYNAMO_ENDPOINT`: Can point to a local DynamoDB instance by setting `http://localhost:4569`.

---
