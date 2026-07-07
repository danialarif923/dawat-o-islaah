import sqlite3
import zipfile
import os

with zipfile.ZipFile('assets/MushafLayouts/indopak-13-lines-layout-qudratullah.db.zip', 'r') as z:
    z.extractall('temp_db')

db_file = os.path.join('temp_db', os.listdir('temp_db')[0])
conn = sqlite3.connect(db_file)
c = conn.cursor()
c.execute('SELECT name FROM sqlite_master WHERE type="table";')
print('Tables:', c.fetchall())

try:
    c.execute('SELECT * FROM words LIMIT 1;')
    print('Words:', c.fetchone())
except Exception as e:
    print('Error getting words:', e)

conn.close()
