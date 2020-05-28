#!/bin/bash
git reset --hard HEAD
git pull

chmod +x deploy.sh
chmod +x server/restart.sh
chmod +x server/start.sh
chmod +x server/stop.sh

cd client
npm run build

cd ../server
./restart.sh
