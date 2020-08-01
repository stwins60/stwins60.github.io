---
layout: post
title:  "Snort Intrusion Detection, Rule Writing, and PCAP Analysis"
date:   2020-05-30
categories: [network, security]
---

## TOC
* This will become a table of contents. Don't touch!
{:toc}

## The course

The course this post is based off of is Snort Intrusion Detection, Rule Writing, and PCAP Analysis by Jesse Kurrus.

## Tools

-   OSes
    -   Kali
    -   Windows 7
    -   [Security Onion](https://github.com/Security-Onion-Solutions/security-onion/blob/master/Verify_ISO.md)
-   Snort IDS
-   Squirt


### Snort Resources

-   [Snort Users Manual](http://manual-snort-org.s3-website-us-east-1.amazonaws.com/)
-   [Snort Rule Writing Manual](http://manual-snort-org.s3-website-us-east-1.amazonaws.com/node27.html)
-   [Infosec Institute Snort Rule Writing Overview](http://resources.infosecinstitute.com/snort-rules-workshop-part-one/#gref)
-   [Emerging Threats Snort Rules](https://rules.emergingthreats.net/open/snort-2.9.0/rules/)
-   [Snort Community and Blog Network](https://snort.org/community)
-   [Security Onion Google Group](https://groups.google.com/forum/#!forum/security-onion)

## Lab 1: Security Onion VM Setup

Some specific network settings should be used to allow capturing of packets.

![](/static/images/2020-05-30-snort-intrusion-detection-rule-writing-and-pcap-analysis/vm-network-interfaces.PNG)
![](/static/images/2020-05-30-snort-intrusion-detection-rule-writing-and-pcap-analysis/sec-onion-vm-network-settings-1.PNG)
![](/static/images/2020-05-30-snort-intrusion-detection-rule-writing-and-pcap-analysis/sec-onion-vm-network-settings-2.PNG)

### Installation notes

1.  Don't check the box to download updates
2.  Don't download extra drivers/WiFi drivers
3.  Use defaults for partitioning options
4.  Take a snapshot when you log in
5.  Install Guest additions, then `sudo reboot now`.
6.  Run 'Setup' on the desktop.
7.  Choose 'Yes' for 'configure /etc/network/interfaces'.
8.  Choose `enp0s3` for the management interface, because this is the NAT-ed interface.
        
    ![](/static/images/2020-05-30-snort-intrusion-detection-rule-writing-and-pcap-analysis/management-interface-selection.png)
    
    `enp0s8` is the host-only interface, which will only be used for sniffing.
    
9.  Choose DHCP addressing for `enp0s3`.
10. Choose 'Yes' for 'Configure sniffing interfaces'.
11. Your changes should look like this:

    ![](/static/images/2020-05-30-snort-intrusion-detection-rule-writing-and-pcap-analysis/changes-to-network-setup.png)
    
    Click 'Yes' and reboot.

12. After rebooting, run setup again. Skip network config.
13. Select 'Evaluation Mode'.
14. `enp0s8` should be monitored as it is the host-only interface for sniffing.
15. Make a new user, wait for the install to finish, and then some dialog boxes will show up.
    Feel free to read them, they have some useful commands.

Here is the text from the dialog boxes:
    
    Security Onion Setup is now complete!
    
    Setup log can be found here:
    /var/log/nsm/sosetup.log
    
    You may view IDS alerts using Sguil, Squert, or Kibana (if enabled).
    
    Zeek logs can be found in Kibana (if enabled) and the following location:
    /nsm/zeek/
    
    You can check the status of your running services with the sostat utilites:
    
    'sudo sostat' will give you DETAILED information about your service status.
    
    'sudo sostat-quick' will give you a guided tour of the sostat output.
    
    'sudo sostat-redacted' will give you REDACTED information to share with our mailing list if you have questions.
    
    Rules downloaded by Pulledpork are stored in:
    /etc/nsm/rules/downloaded.rules
    
    Local rules can be added to:
    /etc/nsm/rules/local.rules
    
    You can have PulledPork modify the downloaded rules by modifying the files in:
    /etc/nsm/pulledpork/
    
    Rules will be updated every morning.
    
    You can manually update them by running:
    sudo rule-update
    
    Sensors can be tuned by modifying the files in:
    /etc/nsm/NAME-OF-SENSOR/
    
    Please note that the local ufw firewall has been locked down.
    
    It only allows connections to port 22.
    
    If you need to connect over any other port, then run:
    sudo so-allow
    
    If you have any questions or problems, please visit:
    https://securityonion.net
    
    There you'll find the following links:
    FAQ
    Documentation
    Mailing Lists
    IRC channel
    and more!
    
    If you're interested in training, professional services, or hardware appliances, please see:
    
    https://securityonionsolutions.com

### Post-setup

-   Update Security Onion with `sudo soup`. Then reboot.
-   NOTE: Remember that `sudo sostat` can be used for troubleshooting most things in SO (Security Onion).
-   `sudo nsm_sensor_ps-restart` will restart all SO services.
-   Common issue is that Squert doesn't show Snort alerts.
    -   Might be bad custom rules, Sguil service failing, or sniffing interface not processing packets.

### Testing Squert showing Snort alerts

-   Replay a malicious packet using `tcp_replay`:
    -   Run `locate zeus` to find the pcap.
    -   Run `sudo tcpreplay -l 20 -i enp0s8 -t /opt/samples/zeus-sample-1.pcap` to replay the pcap 20 times.
    -   Ignore the error messages.
    -   Double click 'Squert' on the desktop and login.
        You should see alerts indicating ZEUS Trojan activity.
    -   If you don't see these alerts, this is bad and you must troubleshoot.

## Lab 2: Boleto Malware Snort Rule Writing and PCAP analysis

### Setup

-   Go to <http://malware-traffic-analysis.net/> and download the pcap file from the 'YOUR HOLIDAY PRESENT' exercise.

Optional UI options:

-   edit > preferences > appearance > columns
-   uncheck 'no', 'protocol', 'length' (if you want, I left 'no' and 'protocol'.)
-   add 2 new columns:
    -   'Src Port' - Src Port (unresolved)
    -   'Dst Port' - Dst Port (unresolved)
    
-   Filter to only view `http.request` to only see HTTP requests:

![](/static/images/2020-05-30-snort-intrusion-detection-rule-writing-and-pcap-analysis/lab2-httprequest.png)

-   Then, click on any host in the request, and `right click > apply as column`.

![](/static/images/2020-05-30-snort-intrusion-detection-rule-writing-and-pcap-analysis/lab2-httphost-column.png)

-   `view > time display format > first option`
-   `view > time display format > seconds: 0`

### Analysis

This network traffic is from a user called 'Matthew Frogman' who clicked on a malicious email and got infected.

The domain `wme0hsxg [dot] e6to8jdmiysycbmeepm29nfprvigdwev [dot] top`, in packet 117, is the root cause of the infection.

They clicked on this link in an email and as a result, downloaded a VBE file that kicked off the infection.

Packet number 199 shows the request that asks for the VBE file:

![](/static/images/2020-05-30-snort-intrusion-detection-rule-writing-and-pcap-analysis/lab2-vbe.png)

VBE files are like VBS scripts, but encoded. <!-- TODO: decode it! analyze it! -->

All of the .txt, .tiff, .dll, .exe files are post-infection files (i.e. packet 379):

![](/static/images/2020-05-30-snort-intrusion-detection-rule-writing-and-pcap-analysis/lab2-post-infect-txt.png)

Some other indicators of post-infection are packets like packet 484 or 2467.

### Making snort rules based off of these packets

-   Open a terminal
-   `sudo vi /etc/nsm/rules/local.rules`

{% highlight bash linenos %}

alert tcp $HOME_NET any -> $EXTERNAL_NET $HTTP_PORTS (msg:"Probable successful phishing attack."; flow:established,to_server; content:"GET"; http_method; content:"/1dkfJu.php?"; http_uri; classtype: trojan-activity; sid: 10000001; rev:1;)
alert tcp $HOME_NET any -> $EXTERNAL_NET $HTTP_PORTS (msg:"Probable post-infection - Boleto-themed malicious spam. First indicator."; flow:established,to_server; content:"GET"; http_method; content:"/bibi/"; http_uri; pcre:"/(\.txt|\.tiff|\.zip|\.dll|\.exe)/U"; classtype:trojan-activity; sid:10000002; rev:1;)
alert tcp $HOME_NET any -> $EXTERNAL_NET $HTTP_PORTS (msg:"Probable post-infection - Boleto-themed malicious spam. Second indicator."; flow:established,to_server; content:"GET"; http_method; content:"/bsb/infects/index.php?"; http_uri; classtype:trojan-activity; sid:10000003; rev:1;)
alert tcp $HOME_NET any -> $EXTERNAL_NET $HTTP_PORTS (msg:"Probable post-infection - Boleto-themed malicious spam. Third indicator."; flow:established,to_server; content:"GET"; http_method; content:"/bsb/debugnosso/index.php?"; http_uri; classtype:trojan-activity; sid:10000004; rev:1;)
alert tcp $HOME_NET any -> $EXTERNAL_NET $HTTP_PORTS (msg:"Probable post-infection - Boleto-themed malicious spam. Fourth indicator."; flow:established,to_server; content:"POST"; http_method; content:"/mestre/admin/x.php"; http_uri; classtype:trojan-activity; sid:10000005; rev:1;)

{% endhighlight %}

#### Line 1

Alert on TCP traffic coming from our internal net to an external network that is using HTTP ports.

The content match for the content after the 'HTTP GET' filter comes from TCP stream 1, which contains `/1dkfJu.php?`,
which is an indicator of Boleto malware. This is static, as opposed to all parameters that come after the question 
mark.

Note that this will ONLY match HTTP request URI content containing `/1dkfJu.php?`, not HTTP request body content, 
because of the rules.

#### Line 2

Alert on TCP traffic coming from our internal net to an external network that is using HTTP ports.

The content match for the content of the HTTP URI comes from packets like 1393, which download payloads from
the `/bibi/` directory.

This expression, `pcre:"/(\.txt|\.tiff|\.zip|\.dll|\.exe)/U";`, is a Perl-style regex that matches a few file extensions.

#### Line 3

Similar to the first two, but a different URI indicator.

Packet 484 has a URI beginning with `/bsb/infects/index.php?`.

Follow the TCP stream of that packet, and you'll see what we use for line 4's rule.

#### Line 4

Similar to the first three, but again, a different URI indicator.

Packet 487 has the URI we will use, which is `/bsb/debugnosso/index.php?`:

![](/static/images/2020-05-30-snort-intrusion-detection-rule-writing-and-pcap-analysis/lab2-debugnosso.png)

#### Line 5

Similar to the first four, but matches HTTP POST instead of HTTP GET.

Packet 2467 has the URI we will use in this filter, `/mestre/admin/x.php`.

### Testing the rules

After copying the rules into `/etc/nsm/rules/local.rules`, run

    sudo rule-update

to use the new rules, and then  

    sudo tcpreplay -t -i enp0s8 2016-12-17-traffic-analysis-exercise.pcap

To replay the captured packets over our sniffing interface.

You can add `-l 5` to run it 5 times.

Remember that `enp0s8` is our sniffing interface. Might be different for you depending on what VM 
solution you use.

If we wrote the rules correctly, we should see it show up in Squert!

![](/static/images/2020-05-30-snort-intrusion-detection-rule-writing-and-pcap-analysis/lab2-squert.png)

![](/static/images/2020-05-30-snort-intrusion-detection-rule-writing-and-pcap-analysis/lab2-squert2.png)

That's it!

## Lab 3: Vetting Snort Rule Quality with Dumbpig

Dumbpig is a great tool to validate snort rules.

<https://github.com/leonward/dumbpig/>

Clone the repo:

    git clone https://github.com/leonward/dumbpig/

Install Parse::Snort in perl:

    sudo cpan Parse::Snort
    
Test the Snort rules we wrote:

    cd dumbpig
    sudo perl dumbpig.pl -r /etc/nsm/rules/local.rules

You can also [download some bad rules here](/static/files/2020-05-30-snort-intrusion-detection-rule-writing-and-pcap-analysis/bad-rules.rules). Feel free to test them.

## Lab 4: TODO