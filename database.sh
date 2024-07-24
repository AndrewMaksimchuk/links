echo "[ .tables ]"
sqlite3 ./database.sqlite '.tables'

echo -e "\n[ SELECT * FROM users ]"
sqlite3 ./database.sqlite '.mode col' 'SELECT * FROM users'

# echo -e '\n[ SELECT * FROM links ]'
# sqlite3 ./database.sqlite '.mode col' 'SELECT * FROM links'

echo -e '\n[ SELECT * FROM tags ]'
sqlite3 ./database.sqlite '.mode column' 'SELECT * FROM tags'

echo -e '\n[ SELECT * FROM vlinks ]'
sqlite3 ./database.sqlite '.mode column' 'select * from vlinks'
