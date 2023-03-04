#!/bin/bash
# For some reason, SvelteKit's node adapter doesn't use any HTTP compression.
# The only way to use it I found is to alter one of the build files.
# This script needs to be run after `pnpm build` from project's root directory.

set -e
FILE=build/index.js
MSG="// compression injected"

if tail -n1 "$FILE" | grep -Fq "$MSG"; then
    echo "Already injected"
    exit
fi

R1="s/import http from 'http';/import http from 'http';\nimport compression from 'compression';/"
R2="s/const server = polka().use(handler);/const server = polka().use(compression()).use(handler);/"
sed -e "$R1" -e "$R2" -i "$FILE"
echo "$MSG" >> "$FILE"

echo "Injected HTTP compression into node build"
