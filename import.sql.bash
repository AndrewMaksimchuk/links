sqlite3 ./database.sqlite '.import --csv --skip 1 /tmp/users.csv  users'
sqlite3 ./database.sqlite '.import --csv --skip 1 /tmp/tags.csv   tags'
sqlite3 ./database.sqlite '.import --csv --skip 1 /tmp/links.csv  links'
sqlite3 ./database.sqlite '.import --csv --skip 1 /tmp/vlinks.csv vlinks'
