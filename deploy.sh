#!/bin/bash
# Deploy merged data, import command, and root-word search files to the server
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

# ============================================================
# Root Word Search deployment
# ============================================================
echo ""
echo "=== Root Word Search Deployment ==="

echo "Uploading management command..."
scp -i "$KEY" -o StrictHostKeyChecking=no hadith/management/commands/import_word_roots.py "$SERVER:$REMOTE_DIR/hadith/management/commands/"

echo "Uploading server patch script and quran modules..."
scp -i "$KEY" -o StrictHostKeyChecking=no patch_server.py "$SERVER:$REMOTE_DIR/"
scp -i "$KEY" -o StrictHostKeyChecking=no quran/root_models.py "$SERVER:$REMOTE_DIR/quran/"
scp -i "$KEY" -o StrictHostKeyChecking=no quran/root_search.py "$SERVER:$REMOTE_DIR/quran/"

echo "Uploading rewrite_urls.py..."
scp -i "$KEY" -o StrictHostKeyChecking=no rewrite_urls.py "$SERVER:$REMOTE_DIR/"

echo "Running server patch..."
ssh -i "$KEY" -o StrictHostKeyChecking=no "$SERVER" "cd $REMOTE_DIR && python patch_server.py"

echo ""
echo "Done! Root word search deployed."
