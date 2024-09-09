default:
	bun run dev

database-preview:
	bash database.sh

database-clear:
	sqlite3 ./database.sqlite '.mode box' 'delete from users'
	sqlite3 ./database.sqlite '.mode box' 'delete from links'
	sqlite3 ./database.sqlite '.mode box' 'delete from vlinks'
	sqlite3 ./database.sqlite '.mode box' 'delete from tags'

clean:
	rm -rf node_modules/ package-lock.json bun.lockb

install:
	bun install --verbose
