# Taken from: http://stackoverflow.com/questions/39086/search-and-replace-a-line-in-a-file-in-python

from tempfile import mkstemp
from shutil import move
import os, os.path
from os import remove, close
import json
from pprint import pprint

def replace_host(host):
    if (host == 'local'):
        return 'http://localhost:3000'
    elif (host == 'dylan'):
        return 'http://198.199.85.62:3000'
    elif (host == 'nathan'):
        return 'http://198.199.82.58:3000'
    else:
        raise Exception('Bad host in settings.json')

def process_settings():
    json_data = open('./settings.json')
    data = json.load(json_data)
    host_sub = replace_host(data['host'])

    walk_replace('./www', '%settings.host%', host_sub)

def replace(file_path, pattern, subst):
    # Create temp file
    fh, abs_path = mkstemp()
    new_file = open(abs_path, 'w')
    old_file = open(file_path)
    for line in old_file:
        new_file.write(line.replace(pattern, subst))

    # Close temp file
    new_file.close()
    close(fh)
    old_file.close()
    # Remove original file
    remove(file_path)
    # Move new file
    move(abs_path, file_path)

def walk_replace(start_path, pattern, subst):
    for root, dirs, files in os.walk(start_path):
        for name in files:
            if name.endswith((".html", ".js")):
                file_name = root + '/' + name
                replace(file_name, pattern, subst)


def main():
    process_settings()

main()
