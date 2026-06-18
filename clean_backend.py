with open('/home/ubuntu/apps/dawat-o-islaah-server/hadith/views.py', 'r') as f:
    content = f.read()

old = """    if hadith_no is not None and str(hadith_no).isdigit():
        queryset = queryset.filter(hadith_number=int(hadith_no))
        paginator = Paginator(queryset, 1)
    else:
        if hadith_no is not None and str(hadith_no).isdigit():
        queryset = queryset.filter(hadith_number=int(hadith_no))
        paginator = Paginator(queryset, 1)
    else:
        paginator = Paginator(queryset, 20)"""

new = """    if hadith_no is not None and str(hadith_no).isdigit():
        queryset = queryset.filter(hadith_number=int(hadith_no))
        paginator = Paginator(queryset, 1)
    else:
        paginator = Paginator(queryset, 20)"""

content = content.replace(old, new)

with open('/home/ubuntu/apps/dawat-o-islaah-server/hadith/views.py', 'w') as f:
    f.write(content)

print('Fixed')
