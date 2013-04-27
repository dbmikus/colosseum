# Taken from: http://stackoverflow.com/questions/39086/search-and-replace-a-line-in-a-file-in-python

from tempfile import mkstemp
from shutil import move
import os, os.path
from os import remove, close
import json
from pprint import pprint
from distutils import dir_util
import shutil

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

    walk_replace('./www-src', './www', '%settings.host%', host_sub)

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

def walk_replace(start_path, to_path, pattern, subst):
    # If the directory exists, remove it to prevent issues with moving of
    # src files to build files
    if (os.path.exists(to_path)):
        shutil.rmtree(to_path)

    # Copy the source files to the built file directory
    dir_util.copy_tree(start_path, to_path)

    # We perform all replacements in the built directory so the source contains
    # the variables still
    for root, dirs, files in os.walk(to_path):
        for name in files:
            # If you have other files where you want to replace variables,
            # then add their filetype here
            if name.endswith((".html", ".js")):
                file_name = root + '/' + name
                replace(file_name, pattern, subst)



def main():
    process_settings()

main()
