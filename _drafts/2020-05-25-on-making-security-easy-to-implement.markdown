---
layout: post
title:  "On making security easy to implement"
date:   2020-05-25 13:30:00 -0500
categories: [personal, programming, security, rant]
---

# THIS IS A DRAFT

As a programmer and a "security practitioner", I often find myself learning a lot about security tools and secure coding
practices. As a result of that, I have gained a larger amount of secure coding practices and knowledge about specific
security vulnerabilities, and exactly what one *should not* do when coding a system that needs to be secure.

## main points:
-   it /should/ be HARD and OBVIOUS to create security defects in apps
-   it should be easy to create secure apps
    -   moreso, devs should not NEED to think about security as much as they do
        -   part of that should be taken care of by the framework that they use
            -   specifically web frameworks as those handle user input the MOST out of all technologies

## problem:
-   it is EASY and DIFFICULT TO SPOT if a security defect exists in an app

## WHY is it a PROBLEM?
-   frameworks/langs don't care about enforcing security through coding conventions

## COUNTERPOINTS TO MY POINT:
-   Why should Spring/jQuery/Java SQL connectors/PHP care about security?
    -   is it /their/ job?
        -   whose job is security? in my mind, everyone's, but that may mean that it's noone's job...
-   Shouldn't devs just learn about security?

## todo:

-   sqli
-   xxe
-   xss
    -   jquery does this wrong imo, encourages string concatenation and does not educate devs or enforce sec practices
    -   php really really does this wrong, does not educate devs or enforce sec practices
    -   JSP does this wrong, doesnt educate devs or enforce sec practices
-   more vulns
-   why is it easy to code insecurely?
-   shoudlnt it be secure by default?
-   change future frameworks to be secure BY DEFAULT
    -   this changes dev behavior
    -   it teaches devs the right way to do stuff
    -   i.e. if you want to use non-parameterized queries, or enable DTD parsing, you will need to set flags that are 
        explicitly shown as insecure to make devs think about it more
    -   Without knowledge of XXE, how the heck is a dev supposed to know? it would be nice if they knew because they
        set some 'enable-dangerous-dtd-parsing' flag and that would cause them to research or think more about it, the
        same can be said of SQLi
-   a lot of devs (in my experience tutoring) are not security-focused and it is not malicious ignoring of sec practices,
    they simply don't know and it is hard for them to gain a good working knowledge of SQLi, XSS, etc. 