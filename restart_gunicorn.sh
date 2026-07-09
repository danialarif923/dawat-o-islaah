#!/bin/bash
set -e
sudo kill -9 $(ps aux | grep '[g]unicorn' | awk '{print $2}') 2>/dev/null || true
sleep 3
find /home/ubuntu/apps/dawat-o-islaah-server -name '__pycache__' -type d -exec rm -rf {} + 2>/dev/null || true
find /home/ubuntu/apps/dawat-o-islaah-server -name '*.pyc' -delete 2>/dev/null || true
cd /home/ubuntu/apps/dawat-o-islaah-server
source venv/bin/activate
gunicorn dawat_o_islaah.wsgi:application --bind 127.0.0.1:8000 --workers 3 --timeout 120 --daemon 2>&1
sleep 3
ps aux | grep -c '[g]unicorn'
