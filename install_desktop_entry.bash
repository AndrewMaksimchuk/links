#!/usr/bin/env bash

projectdir=$(realpath `dirname $0`)

file_content="
[Desktop Entry]
Name=Links
Type=Application
Comment=Save links
Terminal=false
Categories=Education;"

desktop_file="$projectdir/links.desktop"

echo "$file_content" > $desktop_file
echo "Exec=$projectdir/links" >> $desktop_file
echo "Icon=$projectdir/links.png" >> $desktop_file

desktop-file-install --dir=$HOME/.local/share/applications $desktop_file
update-desktop-database -v ~/.local/share/applications
