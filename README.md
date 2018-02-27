PS4 Exploit Host
================

## What is this?
This is an easy way for anyone to host their own exploit for the PS4 on their LAN. features include:
- Hosts your choice of exploit (Specter, IDC, and XVortex included in [releases](https://github.com/Al-Azif/ps4-exploit-host/releases))
- Sends your choice of payload after a successful exploit
- Blocks PSN domains from resolving (Stops accidental updates and block telemetry)
- Can serve the 4.55 update to your PS4
- Works on just about every platform

If you do not want to host the package yourself you can use my remote DNS. See the `Using remote DNS` section below.

## Requirements
- If you are not using a binary release you will need [Python 3](https://www.python.org/downloads/)
- Root privileges on non-Windows machines

## How to download
- Download the zip on the [releases](https://github.com/Al-Azif/ps4-exploit-host/releases) page
- Download with Git, be sure to grab the submodules. This does not include any exploits or payloads.

    `git clone --recursive https://github.com/Al-Azif/ps4-exploit-host.git`

## Using remote DNS (Run Nothing Locally)
0. Make sure the PS4 is on firmware 4.55 or lower (`Settings > System > System Information`).
    - If your firmware version is >4.55 you are out of luck there is no public exploit available and you cannot downgrade.
1. On your PS4 go to `Settings > Network > Setup Network` to setup a network. When you get to DNS Settings select `Manual` and set the Primary to `165.227.83.145` and the Secondary DNS to `108.61.128.158` or visa-versa.
    - If your firmware version is <4.55 you will get a network update available. This is for 4.55.
2. On the PS4, go to `Settings > User's Guide` and select it. The exploit selection should appear.
    - You can also open browser and the default homepage will be the exploit selection.
3. If you use Specter or IDC you will need to use another program to send a payload.

## How to run (Run Locally)
1. Download the files (As shown in the "How to download" section above)
2. Double click the executable (`ps4-exploit-host.exe`, `start.py`, etc). If it starts with no errors, note the IP given
    - Alteratively run it from the command line (`ps4-exploit-host.exe`, `./ps4-exploit-host`, `python start.py`, etc)
    - If you are not root when running on a non-Windows machine you need to use `sudo`
3. On your PS4 `Settings > Network > Setup Network` to setup a network. When you get to DNS Settings select `Manual` and set the Primary and Secondary DNS to the IP address you noted above.
4. Make sure the PS4 is on firmware version 4.55 (`Settings > System > System Information`). If it is not use the jump to the "How to use the Updater" section before continuing
    - If your firmware version is >4.55 you are out of luck there is no public exploit available and you cannot downgrade.
5. On the PS4, go to `Settings > User's Guide` and select it. The exploit should run and there should be output on the script window.
6. The script will prompt you to choose a payload to send. You may send the integrated payload or any payloads located in the `payload` folder.
7. When done use `Ctrl+C` to cleanly close the application

## Running on Raspberry Pi
While the "How to run" section applies to the Pi as well there are some more complex options people may want to use for the Pi like running without any network whatsoever.

- To run as a standalone device that you plug directly into your PS4 though ethernet go [here](https://gist.github.com/Al-Azif/fe2ae67a2fb06cc136580b1e923c7aac) (Supports any Pi with a ethernet port)
- To run as a WiFi access point for your PS4 go [here](https://gist.github.com/Al-Azif/765740019c45b9a49cbf739609cadda7) (Officially supports RPi 3 currently, may work on others with WiFi adapter)

## How to use the built in updater
0. Follow the "How to run" section until it says to come here
1. Put the system update in the `updates` folder as `PS4UPDATE_SYSTEM.PUP`
    - Optionally put the recovery update in the `updates` folder as `PS4UPDATE_RECOVERY.PUP`

        **SYS MD5:** 9C85CE3A255719D56F2AA07F4BE22F02

        **REC MD5:** 6C28DBF66F63B7D3953491CC656F4E2D

2. MAKE SURE THE DNS IS SET CORRECTLY!
3. **SEE #2 I'M SO SERIOUS!**
4. There should be a different page on the `System Software Update > View Details` option on the PS4. It will be obvious!
    - The PS4 is not using the right DNS if you get the standard Sony changelog page. **STOP IMMEDIATELY AND RESTART THE ENTIRE PROCESS**
5. Run a system update on your PS4 system.
6. Return to the "How to run" section

## Other Flags
- Use the `--debug` flag to turn on the DNS & HTTP server output. This will make it hard to use the script normally as it will push the payload menu off the screen
- Use the `--interface` flag to specify which interface to bind to.

        ex. sudo python3 start.py --interface 192.168.2.12
- Use the `--dns_only` flag to only run the DNS server (Disables HTTP server, the payload sender is also disabled as this depends on the HTTP server).
- Use the `--http_only` flag to only run the HTTP server (Disables DNS server).
- Use the `--autosend` flag to automatically send the like-named payload from the payloads directory (No payload menu will be shown)

        ex. sudo python3 start.py --autosend debug_settings.bin

- Create a `dns.conf` file in the same directory as the main application to append rules to the DNS server.

        ex. `A example.com 0.0.0.0` will block example.com. You can use `{{SELF}}` to specify the computer running the DNS server.

## Troubleshooting

#### Script Related
Before seeking help run though the following list:
- Use the most recent release.
- Follow the directions exactly, do not try to get fancy then come for help.
- If the server starts (It gives you an IP and has not errored out) and you cannot connect from your PS4, with 99.99% certainty your firewall/anit-virus is blocking it.
- Disable other networking apps that may interfere with the script if you get port errors (Skype, Discord, Torrent Clients, XAMPP, Firewalls, etc).
- It is normal to get some errors (PSN & NAT) while running the network test. This proves the PSN domains are blocked correctly.

#### Exploit/Payload Related
These are NOT related to this script in any way, but rather the exploits/payloads themselves:
- Make sure your PS4's firmware is on 4.55 exactly. There is no downgrading. If you are above 4.55 you are out of luck for now.
- The PS4 can get a kernel panic and just shutoff. Physically unplug the power for a second (Or hold the power button forever), then power it back on.
- "Out of Memory" errors while loading the exploit page are normal, restart your PS4 if you get a lot of them in a row.
- The FTP servers can take a minute to start. Be patient and try again in a 30 seconds.
- Some FTP payloads (None of the included ones) must be compiled or hex edited with your PS4's/Computer's IP.
- FTP payloads do not have full access under Specter's exploit.
- You must leave the exploit page open for FTP to work as it runs in the webkit process.
- IDC's exploit page does not completely load even when it works.

## Contributing
You can check the [issue tracker](https://github.com/Al-Azif/ps4-exploit-host/issues) for my to do list and/or bugs. Feel free to send a [pull request](https://github.com/Al-Azif/ps4-exploit-host/pulls) for whatever.
Be sure to report any bugs, include as much information as possible.

## What if a new exploit is released?
You should just be able to place the exploit files in the `exploit` directory. The exploit will automatically add the exploit to the menu.

        ex. exploit/new_exploit/index.html

## Why do you commit so many little changes, tweaks, etc?
I have no self control... it also lets people see the actual development. From barely working chicken scratch to actual code.

## Credits
- Specter, IDC, qwertyoruiopz, Flatz, CTurt, Mistawes, XVortex, LightningMods, CelesteBlue123, Anonymous, neofreno, crypt0s, etc
