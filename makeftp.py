#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Make FTP Payload"""

import codecs


def make_ftp(computer_ip, ps4_ip):
    """The main method"""

    computer_ip = computer_ip.split('.')
    computer_ip = '.'.join(computer_ip)

    formatted_comp_ip = b''
    for number in computer_ip:
        formatted_comp_ip += codecs.encode(bytes(number, 'utf-8'), 'hex')

    while len(formatted_comp_ip) < 48:
        formatted_comp_ip += b'0'

    formatted_comp_ip = formatted_comp_ip.decode('utf-8')

    raw_data = raw_data.replace('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', formatted_comp_ip)

    ps4_ip = ps4_ip.split('.')
    ps4_ip = '.'.join(ps4_ip)

    formatted_ps4_ip = b''
    for number in ps4_ip:
        formatted_ps4_ip += codecs.encode(bytes(number, 'utf-8'), 'hex')

    while len(formatted_ps4_ip) < 48:
        formatted_ps4_ip += b'0'

    formatted_ps4_ip = formatted_ps4_ip.decode('utf-8')

    result = raw_data.replace('YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY', formatted_ps4_ip)

    return bytearray.fromhex(result)


if __name__ == '__main__':
    pass