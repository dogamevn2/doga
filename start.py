#!/usr/bin/env python
"""Easy PS4 Exploit Hosting by Al-Azif
   Source: https://github.com/Al-Azif/ps4-exploit-host
"""

# IMPORTS
import ctypes
import os
import SimpleHTTPServer
import socket
import SocketServer
import subprocess
import sys

# GLOBAL VARS
SCRIPT_LOC = os.path.realpath(__file__)
CWD = os.path.dirname(SCRIPT_LOC)
FAKE_LOC = os.path.join(CWD, 'FakeDns', 'fakedns.py')
DNS_LOC = os.path.join(CWD, 'dns.conf')
EXPLOIT_LOC = os.path.join(CWD, 'exploit', '')
FILETYPES = {
    # "Acceptable" Filetypes to serve
    '.css': 'text/css',
    '.eot': 'application/vnd.ms-fontobject',
    '.gif': 'image/gif',
    '.html': 'text/html',
    '.ico': 'image/x-icon',
    '.jpg': 'image/jpeg',
    '.js': 'application/javascript',
    '.otf': 'application/x-font-opentype',
    '.png': 'image/png',
    '.sfnt': 'application/font-sfnt',
    '.svg': 'image/svg+xml',
    '.ttf': 'application/x-font-truetype',
    '.woff': 'application/font-woff',
    '.woff2': 'application/font-woff2'
}


class MyTCPServer(SocketServer.TCPServer):
    """TCPServer to allow instant reuse of port 80"""
    def server_bind(self):
        self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.socket.bind(self.server_address)


class MyHandler(SimpleHTTPServer.SimpleHTTPRequestHandler):
    """Create Handler for HTTP Requests (This is so it works for all languages)

       *ALL* requests will be directed to like named files in EXPLOIT_LOC
    """
    def do_GET(self):
        try:
            ext = '.' + self.path.rsplit('.', 1)[-1]
            with open(EXPLOIT_LOC + self.path.rsplit('/', 1)[-1]) as f:
                self.send_response(200)
                self.send_header('Content-type', FILETYPES[ext])
                self.end_headers()
                self.wfile.write(f.read())
        except (IOError, KeyError):
            self.send_error(404, 'File Not Found')


def checkroot():
    """Checks if the user is admin/root

       Returns: Boolean
    """
    try:
        root = os.getuid() == 0
    except AttributeError:
        root = ctypes.windll.shell32.IsUserAnAdmin() != 0

    return root


def getlan():
    """Gets the computer's LAN IP

       Returns: String
    """
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('10.255.255.255', 1))
        lan = str(s.getsockname()[0])
        s.close()
    except socket.error:
        s.close()
        sys.exit('>> Unable to find LAN IP')

    return lan


def writeconf(lan):
    """Writes the configuration file for FakeDns

        Input:   IPv4 Address as String
        Returns: Boolean
    """
    exists = os.path.isfile(DNS_LOC)

    try:
        with open(DNS_LOC, 'w') as f:
            f.write('A manuals.playstation.net ' + lan)
        if not exists:
            fixpermissions()
        return True
    except IOError:
        return False


def fixpermissions():
    """Make FakeDNS config file the same permissions as start.py

        This should only be run if the config didn't exist before
    """
    try:
        stats = os.stat(SCRIPT_LOC)
        os.chown(DNS_LOC, stats.st_uid, stats.st_gid)
        os.chmod(DNS_LOC, stats.st_mode)
    except AttributeError:
        pass
    except OSError:
        print '>> Unable to change permissions of ' + DNS_LOC + os.linesep + \
              '   ^^ This is a non-fatal error ^^'


def startservers():
    """Start the DNS and HTTP Server"""
    try:
        dns = subprocess.Popen(['python', FAKE_LOC, '-c', DNS_LOC])
    except IOError:
        sys.exit('>> Unable to locate FakeDns')

    try:
        httpd = MyTCPServer(('', 80), MyHandler)
    except socket.error:
        dns.kill()
        sys.exit('>> Port 80 already in use')
    try:
        print '>> Starting HTTP Server...'
        httpd.serve_forever()
    except KeyboardInterrupt:
        httpd.shutdown()
        httpd.server_close()
        dns.kill()
        sys.exit()


def main():
    """The main logic"""
    if checkroot() is False:
        sys.exit('>> This must be run by root as it requires port 53 & 80')

    lan = getlan()

    if writeconf(lan) is False:
        sys.exit('>> Unable to write ' + DNS_LOC)
    else:
        print '>> Your DNS IP is ' + lan

    startservers()


if __name__ == '__main__':
    main()
