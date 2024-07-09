# sqlite3 ./database.sqlite '.mode box' 'delete from users'

echo "[ .tables ]"
sqlite3 ./database.sqlite '.tables'

echo -e "\n[ SELECT * FROM users ]"
sqlite3 ./database.sqlite '.mode col' 'SELECT * FROM users'

echo -e '\n[ SELECT * FROM links ]'
sqlite3 ./database.sqlite '.mode col' 'SELECT * FROM links'
