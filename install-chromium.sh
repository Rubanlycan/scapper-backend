#!/bin/bash

npm install puppeteer

mkdir -p chromium
cp -r .cache/puppeteer/chrome/*/chrome-linux64 chromium/
chmod +x chromium/chrome