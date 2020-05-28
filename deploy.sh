#!/bin/bash
git reset --hard HEAD
git pull

chmod +x deploy.sh
chmod +x client/restart.sh
chmod +x client/start.sh
chmod +x client/stop.sh

cd client
npm run build

cd ../server
./restart.sh
