#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Easy PS4 Exploit Hosting by Al-Azif
   Source: https://github.com/Al-Azif/ps4-exploit-host
"""

from __future__ import print_function

import sys
if sys.version_info.major < 3:
    print('This cannot be run under Python 2')
    try:
        input('Press [ENTER] to exit')
    finally:
        sys.exit()

import argparse
import hashlib
from http.server import BaseHTTPRequestHandler
from http.server import HTTPServer
import ipaddress
import mimetypes
import os
import re
import socket
from socketserver import ThreadingMixIn
import threading
import time

import FakeDns.fakedns as fakedns

SCRIPT_LOC = os.path.realpath(__file__)
CWD = os.path.dirname(SCRIPT_LOC)
EXPLOIT_LOC = os.path.join(CWD, 'exploit')
FAKE_LOC = os.path.join(CWD, 'FakeDns', 'fakedns.py')
DNS_LOC = os.path.join(CWD, 'dns.conf')
DEBUG = False


class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
    pass


class MyHandler(BaseHTTPRequestHandler):
    server_version = ''
    sys_version = ''
    error_message_format = ''

    def do_GET(self):
        client = self.client_address[0]
        if not check_lan(client, get_network(get_lan())):
            self.send_error(403)
        else:
            try:
                path = self.path.rsplit('/', 1)[-1]
                if path == 'ps4-updatelist.xml':
                    region = self.path.split('/')[4]
                    path = os.path.join(CWD, 'updates', 'ps4-updatelist.xml')
                    with open(path, 'rb') as buf:
                        xml = buf.read()
                    xml = xml.replace(b'{{REGION}}', bytes(region, 'utf-8'))
                    self.send_response(200)
                    self.send_header('Content-type', 'application/xml')
                    self.end_headers()
                    self.wfile.write(xml)
                elif path == 'ps4-updatefeature.html':
                    path = os.path.join(CWD, 'updates', path)
                    with open(path, 'rb') as buf:
                        self.send_response(200)
                        self.send_header('Content-type', 'text/html')
                        self.end_headers()
                        self.wfile.write(buf.read())
                elif self.path.endswith('.PUP'):
                    path = os.path.join(CWD, 'updates', path)
                    with open(path, 'rb') as buf:
                        self.send_response(200)
                        self.send_header('Content-type', 'text/plain')
                        self.end_headers()
                        self.wfile.write(buf.read())
                elif re.match('/document/[a-zA-Z\-]{2,5}/ps4/', self.path):
                    if not path:
                        path = 'index.html'
                    mime = mimetypes.guess_type(path)
                    if not mime[0]:
                        mime[0] = 'application/octet-stream'
                    with open(os.path.join(EXPLOIT_LOC, path), 'rb') as buf:
                        self.send_response(200)
                        self.send_header('Content-type', mime[0])
                        self.end_headers()
                        self.wfile.write(buf.read())
                else:
                    self.send_error(404)
            except IOError:
                self.send_error(404)

            if path == 'rop.js':
                payload_menu = True
                for thread in threading.enumerate():
                    if thread.name == 'Payload_Brain':
                        payload_menu = False

                if payload_menu:
                    print('>> Exploit Sent...')
                    thread = threading.Thread(name='Payload_Brain',
                                              target=payload_brain,
                                              args=(self.client_address[0],),
                                              daemon=True)
                    thread.start()


def check_root():
    """Checks if the user is root.

    Windows returns true because there are no priviledged ports
    """
    try:
        root = bool(os.getuid() == 0)
    except AttributeError:
        root = True

    return root


def get_lan():
    """Gets the computer's LAN IP"""
    soc = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        soc.connect(('10.255.255.255', 1))
        lan = str(soc.getsockname()[0])
        soc.close()
    except socket.error:
        soc.close()
        closer('ERROR: Unable to find LAN IP')

    return lan


def get_network(ipaddr):
    """Guesses the private network based on the IP address"""
    ipaddr = ipaddr.split('.')

    if ipaddr[0] == '10':
        network = '10.0.0.0/8'
    elif ipaddr[0] == '172' and 16 <= int(ipaddr[1]) <= 31:
        network = '172.16.0.0/12'
    elif ipaddr[0] == '192' and ipaddr[1] == '168':
        network = '192.168.0.0/16'
    else:
        print('WARNING: Could not figure out private network, ' +
              'LAN blocking will not work')
        network = '0.0.0.0/0'

    return network


def check_lan(ipaddr, network):
    """Checks to see if the IP address is contained within the network"""
    if network == '0.0.0.0/0':
        return True
    elif bool(ipaddress.ip_address(ipaddr) in ipaddress.ip_network(network)):
        return True


def write_conf(lan):
    """Writes the configuration file for FakeDns"""
    exists = os.path.isfile(DNS_LOC)

    try:
        with open(DNS_LOC, 'w+') as buf:
            buf.write('A manuals.playstation.net ' + lan + '\n')
            buf.write('A update.playstation.net ' + lan + '\n')
            buf.write('A f[a-z]{2}01.ps4.update.playstation.net ' + lan + '\n')
            buf.write('A h[a-z]{2}01.ps4.update.playstation.net ' + lan + '\n')
            buf.write('A [a-z0-9\.\-]*.cddbp.net 0.0.0.0\n')
            buf.write('A [a-z0-9\.\-]*.ea.com 0.0.0.0\n')
            buf.write('A [a-z0-9\.\-]*.llnwd.net 0.0.0.0\n')
            buf.write('A [a-z0-9\.\-]*.playstation.com 0.0.0.0\n')
            buf.write('A [a-z0-9\.\-]*.playstation.net 0.0.0.0\n')
            buf.write('A [a-z0-9\.\-]*.playstation.org 0.0.0.0\n')
            buf.write('A [a-z0-9\.\-]*.ribob01.net 0.0.0.0\n')
            buf.write('A [a-z0-9\.\-]*.sbdnpd.com 0.0.0.0\n')
            buf.write('A [a-z0-9\.\-]*.scea.com 0.0.0.0\n')
            buf.write('A [a-z0-9\.\-]*.sonyentertainmentnetwork.com 0.0.0.0\n')
        if not exists:
            fix_permissions()
        return True
    except IOError:
        return False


def fix_permissions():
    """Make FakeDNS config file the same permissions as start.py

       This should only be run if the config didn't exist before
       It will not include execution privileges
    """
    try:
        stats = os.stat(SCRIPT_LOC)

        os.chown(DNS_LOC, stats.st_uid, stats.st_gid)

        mask = oct(stats.st_mode & 0o777)
        newmask = ''

        for i in mask:
            if i != 'o':
                if int(i) % 2 != 0:
                    i = str(int(i) - 1)
            newmask += i

        mask = int(newmask, 8)
        os.chmod(DNS_LOC, mask)
    except AttributeError:
        pass
    except OSError:
        print('NON-FATAL ERROR: Unable to change permissions of DNS config')


def check_update_pups():
    """Checks the actual MD5 checksum vs the expected MD5 sum"""
    try:
        with open(os.path.join(CWD, 'updates',
                               'PS4UPDATE_SYSTEM.PUP'), 'rb') as buf:
            print('>> Checking PS4UPDATE_SYSTEM.PUP\'s checksum')
            hasher = hashlib.md5()
            data = buf.read()
            hasher.update(data)
            system_hash = hasher.hexdigest().upper()
            if system_hash != '203C76C97F7BE5B881DD0C77C8EDF385':
                closer('ERROR: PS4UPDATE_SYSTEM.PUP is not version 4.05')
            clear_line()
            print('>> PS4UPDATE_SYSTEM.PUP checksum matches')
    except IOError:
        pass

    try:
        with open(os.path.join(CWD, 'updates',
                               'PS4UPDATE_RECOVERY.PUP'), 'rb') as buf:
            print('>> Checking PS4UPDATE_RECOVERY.PUP\'s checksum')
            hasher = hashlib.md5()
            data = buf.read()
            hasher.update(data)
            recovery_hash = hasher.hexdigest().upper()
            if recovery_hash != '741CFE2F0DEC1BB4663571DE78AE31CF':
                closer('ERROR: PS4UPDATE_RECOVERY.PUP is not version 4.05')
            clear_line()
            print('>> PS4UPDATE_RECOVERY.PUP checksum matches')
    except IOError:
        pass


def start_servers():
    """Start DNS and HTTP servers on seperate threads"""
    print('>> Starting DNS server thread...')
    fakedns.main(DNS_LOC, DEBUG)
    clear_line()
    print('>> DNS server thread is running...')

    print('>> Starting HTTP server thread...')
    server = ThreadedHTTPServer(('', 80), MyHandler)
    thread = threading.Thread(name='HTTP_Server',
                              target=server.serve_forever,
                              args=(),
                              daemon=True)
    thread.start()
    clear_line()
    print('>> HTTP server thread is running...')


def payload_brain(ipaddr):
    payloads = []
    for files in os.listdir(os.path.join(CWD, 'payloads')):
        if not files.endswith('PUT PAYLOADS HERE'):
            payloads.append(files)
    if not payloads:
        print('>> No payloads found')
    else:
        choice = payload_menu(payloads)
        if choice != 0:
            path = os.path.join(CWD, 'payloads', payloads[choice - 1])
            with open(path, 'rb') as buf:
                print('>> Sending {}...'.format(payloads[choice - 1]))
                content = buf.read()
            send_payload(ipaddr, 9020, content)
        else:
            print('>> No payload sent')


def payload_menu(payloads):
    i = 1
    choice = -1
    print('{} Payloads {}'.format('-' * 4, '-' * 46))
    print('0. Don\'t send a payload')
    for payload in payloads:
        print('{}. {}'.format(i, payload))
        i += 1
    print('-' * 60)
    while choice < 0 or choice >= i:
        choice = input('Choose a payload to send: ')
        try:
            choice = int(choice)
        except (ValueError, NameError):
            choice = -1

    return choice


def send_payload(hostname, port, content):
    """Netcat implementation"""
    soc = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    timeout = time.time() + 15
    while True:
        result = soc.connect_ex((hostname, port))
        if result == 0:
            print('>> Connected to PS4')
            timed_out = False
            break
        if time.time() >= timeout:
            print('ERROR: Payload sender timed out')
            timed_out = True
            break
    if not timed_out:
        try:
            soc.sendall(content)
            soc.shutdown(socket.SHUT_WR)
            while True:
                data = soc.recv(1024)
                if not data:
                    break
            print('>> Payload Sent!')
        except socket.error:
            print('ERROR: Broken Pipe')
    soc.close()


def exploit_menu():
    i = 1
    choice = -1
    exploits = os.listdir(EXPLOIT_LOC)
    if not exploits:
        closer('ERROR: No exploits found')
    print('{} Exploits {}'.format('-' * 4, '-' * 46))
    for exploit in exploits:
        print('{}. {}'.format(i, exploit))
        i += 1
    print('-' * 60)
    while choice < 1 or choice >= i:
        choice = input('Choose an exploit to host: ')
        try:
            choice = int(choice)
        except (ValueError, NameError):
            choice = -1

    return exploits[choice - 1]


def silence_http(self, format, *args):
    """Just blackhole this method to prevent printing"""
    pass


def clear_line():
    """Clear last printed line from CLI"""
    sys.stdout.write('\x1b[1A')
    sys.stdout.write('\x1b[2K')


def getch():
    """MIT Licensed: https://github.com/joeyespo/py-getch"""
    import termios
    import tty

    fd = sys.stdin.fileno()
    old = termios.tcgetattr(fd)
    try:
        tty.setraw(fd)
        return sys.stdin.read(1)
    finally:
        termios.tcsetattr(fd, termios.TCSADRAIN, old)


def closer(message):
    """Closing method"""
    print(message)
    if message != '>> Exiting...':
        print('Press any key to exit...', end='')
        sys.stdout.flush()
        if os.name == 'nt':
            from msvcrt import getch as w_getch
            w_getch()
        else:
            getch()
        print()
    sys.exit()


def main():
    """The main logic"""
    global DEBUG
    global EXPLOIT_LOC

    if not check_root():
        closer('ERROR: This must be run by root as it requires port 53 & 80')

    parser = argparse.ArgumentParser(description='PS4 Exploit Host')
    parser.add_argument('--exploit', dest='e_type', action='store',
                        default='', required=False,
                        help='Select which exploit to host')
    parser.add_argument('--debug', action='store_true',
                        required=False, help='Print debug statements')
    args = parser.parse_args()

    try:
        if args.debug:
            DEBUG = True
        else:
            DEBUG = False
            MyHandler.log_message = silence_http

        check_update_pups()

        if not args.e_type:
            args.e_type = exploit_menu()

        if os.path.isdir(os.path.join(EXPLOIT_LOC, args.e_type)) \
           and args.e_type:
            EXPLOIT_LOC = os.path.join(EXPLOIT_LOC, args.e_type)
        else:
            closer('ERROR: Could not find exploit specified')

        lan = get_lan()

        if write_conf(lan):
            print('>> Your DNS IP is {}'.format(lan))
        else:
            closer('ERROR: Unable to write {}'.format(DNS_LOC))

        start_servers()

        while True:
            pass
    except KeyboardInterrupt:
        closer('>> Exiting...')


if __name__ == '__main__':
    main()
