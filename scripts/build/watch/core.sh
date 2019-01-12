#!/bin/bash
echo "Removing old build"
rm -rf packages/*/lib
echo "Creating initial build"

if lerna run build --scope=@snap-doc/cli --scope=@snap-doc/core --scope=@snap-doc/emitter --scope=@snap-doc/types --scope=@snap-doc/markdown-emitter --scope=@snap-doc/utils
then
  echo "Setting up watch build"
  ./node_modules/.bin/concurrently \
    -n "cli,emitter,markdown-emitter,types,utils,core" \
    -c "magenta,cyan,green,yellow,blue,purple" \
    "tsc -w --preserveWatchOutput -p ./packages/cli" \
    "tsc -w --preserveWatchOutput -p ./packages/emitter" \
    "tsc -w --preserveWatchOutput -p ./packages/markdown-emitter" \
    "tsc -w --preserveWatchOutput -p ./packages/types" \
    "tsc -w --preserveWatchOutput -p ./packages/utils" \
    "tsc -w --preserveWatchOutput -p ./packages/core" \
else
    echo "Initial build failed"
fi
