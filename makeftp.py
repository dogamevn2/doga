#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Make FTP Payload"""

from __future__ import print_function

import argparse
import os

SCRIPT_LOC = os.path.realpath(__file__)
CWD = os.path.dirname(SCRIPT_LOC)


def main():
    """The main method"""

    parser = argparse.ArgumentParser(description='PS4 FTP Payload creator')
    parser.add_argument('--ip', action='store',
                        default='', required=True,
                        help='The IP of the PS4')
    args = parser.parse_args()
    result = bytearray.fromhex(raw_data)

    # Computer IP
    result = result.replace('192.168.1.81', args.ip)

    with open(os.path.join(CWD, 'payloads', 'ftp.bin'), 'w+') as f:
        f.write(result)


if __name__ == '__main__':
    main()