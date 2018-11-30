#!/bin/bash
if [ ( "$TRAVIS_PULL_REQUEST" == "false" ) -a ( "$TRAVIS_BRANCH" == "master" ) ]
then
  echo "We are on master. Attempting publish after successful tests"
  yarn test:ci && ./node_modules/.bin/travis-deploy-once .travis/_publish.sh
else 
  echo "Non master, non-pr build"
  yarn test:ci
fi