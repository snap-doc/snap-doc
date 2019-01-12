#!/bin/bash
echo "Removing old build"
rm -rf packages/*/lib
echo "Creating initial build"

if yarn build
then
  echo "Setting up watch build"
  ./node_modules/.bin/concurrently \
    -n "cli,emitter,markdown-emitter,types,utils,core" \
    -c "magenta,cyan,green,yellow,blue,purple" \
    "tsc -w -p ./packages/cli" \
    "tsc -w -p ./packages/emitter" \
    "tsc -w -p ./packages/markdown-emitter" \
    "tsc -w -p ./packages/types" \
    "tsc -w -p ./packages/utils" \
    "tsc -w -p ./packages/core" \
else
    echo "Initial build failed"
fi
