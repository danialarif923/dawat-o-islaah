#!/bin/bash
# Deploy merged data and import command to the server
# Usage: bash deploy.sh

SERVER="ubuntu@13.127.232.43"
KEY="dawat-o-islaah.pem"
REMOTE_DIR="/home/ubuntu/apps/dawat-o-islaah-server"

echo "Creating merged data directory on server..."
ssh -i "$KEY" -o StrictHostKeyChecking=no "$SERVER" "mkdir -p $REMOTE_DIR/merged_data"

echo "Uploading merged data files..."
scp -i "$KEY" -o StrictHostKeyChecking=no merged_data/*.json "$SERVER:$REMOTE_DIR/merged_data/"

echo "Uploading import management command..."
scp -i "$KEY" -o StrictHostKeyChecking=no hadith/management/commands/import_merged.py "$SERVER:$REMOTE_DIR/hadith/management/commands/"

echo "Running import..."
ssh -i "$KEY" -o StrictHostKeyChecking=no "$SERVER" "cd $REMOTE_DIR && source venv/bin/activate && python manage.py import_merged --all --dir=merged_data"

echo "Done!"
