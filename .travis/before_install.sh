#!/bin/bash
echo "TRAVIS_PULL_REQUEST $TRAVIS_PULL_REQUEST"
echo "TRAVIS_PULL_REQUEST_BRANCH $TRAVIS_PULL_REQUEST_BRANCH"
echo "TRAVIS_REPO_SLUG $TRAVIS_REPO_SLUG"

# if [ "$TRAVIS_PULL_REQUEST" != "false" ]; then
#   echo "We are in a pull request, not setting up release"
#   exit 0
# elif [[ $TRAVIS_BRANCH == 'master' ]]; then
#     rm -rf .git
#     git init
#     git clean -dfx
#     git remote add origin https://github.com/snap-doc/snap-doc.git
#     git fetch origin
#     # git clone https://github.com/$TRAVIS_REPO_SLUG.git $TRAVIS_REPO_SLUG
#     git checkout $TRAVIS_BRANCH
#     git config credential.helper store
#     echo "https://mike-north:${GH_TOKEN}@github.com/snap-doc/snap-doc.git" > ~/.git-credentials

#     npm config set //registry.npmjs.org/:_authToken=$NPM_TOKEN -q
#     npm prune
#     echo "npm whoami"
#     npm whoami

#     git config --global user.email "michael.l.north@gmail.com"
#     git config --global user.name "Mike North"
#     git config --global push.default simple

#     git fetch --tags
#     git branch -u origin/$TRAVIS_BRANCH
#     git fsck --full #debug
#     echo "npm whoami"
#     npm whoami #debug
#     echo "git config --list"
#     git config --list #debug
# else
# fi
