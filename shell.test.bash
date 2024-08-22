rm -f database.test.sqlite
DATABASE=database.test.sqlite bun run test.before.ts
DATABASE=database.test.sqlite bun test $1
DATABASE=database.test.sqlite bun run test.after.ts