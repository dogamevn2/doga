#!/usr/bin/env python

import ctypes
import os
import SimpleHTTPServer
import socket
import SocketServer
import subprocess
import sys


# Create Handler for HTTP Requests (This is so it works for all languages)
# *ALL* HTML requests will directed to "exploit/index.html"
# *ALL* JS requests will be directed to like named files in "exploit/"
class Handler(SimpleHTTPServer.SimpleHTTPRequestHandler):
    def do_GET(self):
        try:
            if self.path.endswith('.html'):
                f = open('exploit' + os.sep + 'index.html')
                self.send_response(200)
                self.send_header('Content-type', 'text/html')
                self.end_headers()
                self.wfile.write(f.read())
                f.close()
            if self.path.endswith('.js'):
                f = open('exploit' + os.sep + self.path.rsplit('/', 1)[-1])
                self.send_response(200)
                self.send_header('Content-type', 'application/javascript')
                self.end_headers()
                self.wfile.write(f.read())
                f.close()
        except IOError:
            self.send_error(404, 'File Not Found')


def main():
    try:
        root = os.getuid() == 0
    except AttributeError:
        root = ctypes.windll.shell32.IsUserAnAdmin() != 0
    if root is False:
        sys.exit('>> This must be run by root as it requires port 53 & 80')

    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('10.255.255.255', 1))
        lan = s.getsockname()[0]
    except:
        lan = '127.0.0.1'
    finally:
        s.close()
    print('>> Your DNS IP is ' + lan)

    with open('dns.conf', 'w') as f:
        f.write('A manuals.playstation.net ' + lan)

    dns = subprocess.Popen(['python', 'FakeDns/fakedns.py', '-c', 'dns.conf'])

    try:
        httpd = SocketServer.TCPServer(('', 80), Handler)
    except socket.error:
        dns.kill()
        sys.exit('>> Port 80 already in use')
    try:
        print('>> Starting HTTP Server...')
        httpd.serve_forever()
    except KeyboardInterrupt:
        httpd.server_close()
        dns.kill()
        sys.exit()

if __name__ == '__main__':
    main()
