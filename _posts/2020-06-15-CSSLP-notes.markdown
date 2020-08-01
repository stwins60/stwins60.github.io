---
layout: post
title: "Certified Secure Software Lifecycle Professional (CSSLP) Notes"
date: 2020-06-15
categories: [programming, certification, security]
---

## TOC

* 
This will become a table of contents. Don't touch!  
{:toc}

## Preamble

This is a collection of notes I've taken for the CSSLP. Hopefully they
are useful to you as well!

<https://www.isc2.org/Certifications/CSSLP>

## Secure Software Concepts

### Core Concepts

- Main concept is about restricting user access

#### Confidentiality

- Keep info away from people who don't NEED to know it
- Secret info remains secret

- Must understand what data needs to be kept secret
- In order to do this, data must be classified, e.g.
  - Public
  - Available to everyone
  - Nonpublic
    - Restricted in some way
    - Who can access this data?

```
publicly disclosed? --> no --> disclosed by roles? --> no --> [restricted]
      |                                 |
     yes                               yes
      |                                 |
  [public]                        [confidential]
```

##### Data protection

- Confidentiality Controls
  - _Masking_: Deleting parts of data, i.e. removing first 12 digits of
    credit card
  - Secret writing
    - Covert (hidden among other data)  
      The placement of the data is itself hidden. May also include
      encryption/ciphers.
      - Steganography
      - Digital Watermarking
    - Overt (visible) The data we're protecting is in plain sight, but
      the method of decrypting/deciphering is not known to others.
      - Encryption
      - Hashing (i.e. passwords)

##### Where do we need confidentiality?

- In transit
  - Unprotected Networks
- In processing
  - Data in memory
- In storage
  - Data at rest

#### Integrity

Integrity means the data is protected from any unauthorized change.

Changes must be done by an authorized user. This means we need an
authorization scheme, and a way to determine that data is 'authentic',
to have proof that it was made by

```
minimal/no damage upon change? --> no --> significant damage? --> no --> critical damage
                |                                  |                            |
               yes                                yes                         [high]
                |                                  |
              [low]                            [medium]
```

- Ensure functionality
- Ensure accuracy
- Completeness and consistency (i.e. incomplete update)

##### Input validation

- Users inputting data accidentally
- Many types of accidental or intentional errors
- 'Injection flaw', i.e. SQLi
  - Compromise input of data OR entire system
- Input validation ensures data integrity

##### Parity Bit Checking

- Detects errors or changes made during transit
- An extra bit is added to a piece of data
  - It is `1` if the sum of `1`s in the data is odd, `0` if it's even.
- Fast to calculate, but...
- You can still change data to manipulate the parity check to be
  successful
  - ...all powers of 2 are even (except 2^0), flipping them doesn't
    change the parity.
    - Parity bits are essentially a copy of the last bit AFAICT.

```
0   1   0   0   0   1   1   0  [1] <--- 3 is odd, this parity
                                        bit is 1.
```

##### Cyclic Redundancy Checking (CRC)

- Uses parity bit checking for data integrity
- Good for integrity checking during transmission
- But, CRC can be recalculated and modified

- CRC calc uses 1 bit for polynomial
- Most polynomials are 16/32 bits
- This polynomial is used to calculate a checksum value that is added to
  the data
- More bits = more accuracy = harder to change the data in a way that
  cannot be detected by examining the checksum
- Altering the data results in a mismatch when recalculating the CRC

- CRC are based on cyclic ECC
- CRC =/= hash fn, but very similar in behavior

<https://eklitzke.org/crcs-vs-hash-functions>

##### Hashing

- A hash is a (generally) smaller value derived from performing a
  calculation on a large piece of data
- When putting the large data through a hash fn, the same hash is
  (almost always) going to be returned by the hash function
- `hash(coolio) -> 681`
- When my friend on their computer hashes `coolio`, they also get `681`
- Calculation 'cannot be reversed'
  - ...unless you try every possible input value (brute-force)
  - The ALGORITHM is a ONE-WAY algorithm...hashes CAN BE REVERSED, it's
    just that with strong hashes, this is unfeasible. Try using MD5
    password hashes if a nation-state wants to target you -- They might
    have 10000 GPUs.
- Can ensure confidentiality -- Transmitting a password hash only
  provides the other party _the means to validate a password_, not the
  password itself.
  - This is how NTLM (NT Lan Manager) auth works. Very insecure because
    of OTHER reasons though.
- Many different algos to make hashes
- 'digital fingerprinting'
  - A hash guarantees that the data is intact
  - A digital signature guarantees that the HASH AND DATA were provided
    by a specific entity
  - We know who made it, and that it is intact
  - Example: <http://releases.ubuntu.com/focal/MD5SUMS>
    <http://releases.ubuntu.com/focal/MD5SUMS.gpg>

#### Availability

- Making sure data is available to users
- How valuable is the data?

```
minimal/no impact upon destruction? --> no --> significant impact? --> no --> critical impact
                |                                   |                               |
               yes                                 yes                          [critical]
                |                                   |
            [support]                          [essential]
```

- Low-value data is less critical and is 'more ok' to destroy
- Must ensure no disruption to operation because any interruption could
  make a piece of data unavailable
  - i.e. 'Products' database goes down, and 5,000 stores across America
    depend on that...millions of dollars per minute potentially lost
- Both data and RELATED systems must be protected
  - A breach in any RELATED system could compromise the data

##### Maximum Tolerable Downtime

- Must establish a 'Maximum Tolerable Downtime'
  - MOST systems CAN be down for some amount of time
    - Maybe not nuclear reactors, but bank sites CAN be offline for a
      few hours per day/week.
  - 2 days per week, or '99.9% uptime'
  - Many systems (esp 3rd party) have SLAs (service level agreement)
    that ensures a minimum.

##### Recovery Time Objective

- Must consider RTO when UNPLANNED downtime occurs
- RTO is the maximum amount of time that it takes to recover a system
  from a failure
- This is important when planning SLA lengths
- If we said RTO=1h, and a disaster happened, we should be back up and
  running within 1 hour.

* Targeted duration for recovery
* Explicitly state RTO in SLAs
* Consider this during recovery planning

* Determine the impact of unavailability
  - Can't take orders?
* Measure impact quantitatively and qualitatively
* The way an org uses data will change over time, so both current and
  new data must be considered.

#### Authentication and Authorization 1

- Many ways to authenticate
  - Anonymous
    - Not secure
    - No creds
    - Avoid using this method if you care about securing something
    - Unlinkability
      - You cannot tell WHO performed an action
  - 'Basic'
    - Base64 encoded creds sent over HTTP in every request
    - Basically plaintext creds (encoding is NOT encryption!!!)
      ...so...encrypt your traffic...or don't use this method.
    - Very widely used unfortunately, and common
  - Digest
    - Challenge/response
    - Only password hashes are transmitted
  - Integrated auth
    - Uses challenge-response
    - NTLM auth is integrated with Windows
    - Standalone vs Kerberos v5 auth
  - Client certs
    - Digital Certs
    - Internet/e-commerce
  - Forms
    - Web apps
      - Uname+pw gives the client a auth token to reuse (session token)
    - SSL should be used because uname+pw are transmitted over HTTP.
  - Token-based auth
    - Used with uname+pw
    - Once verified, token is issued
  - Smart Cards
    - Ownership-based auth
    - Creds stored on a microchip
    - Difficult to compromise
      - Needs the password and the smartcard as well
  - Biometrics
    - Unique physical characteristic of user (fingerprints, retina)
    - Can be expensive
    - Suffers from errors (rare though)
      - Type I (False Negative)
      - Type II (False Positive)
    - Detection is complex and errors happen

Forms and basic are different because forms are made by web devs and
basic auth is handled by the webserver software (sent in HTTP headers).

#### Authentication and Authorization 2

Authorization is the act of verifying an entity's permission to perform
an action on an object.

```

subject --- security server ---- permission granted? -- yes --> object access
                                          |
                                         no
                                         |
                                         X
```

- Discretionary Access Control (DAC)
  - Restricts access to object based on identity
  - The task of controlling permissions can be granted to anyone
  - DACs must Maintain an Access Control List (ACL) for the object that
    is getting accessed
    - When someone attempts to access the object, the ACL is checked to
      see if they or one of their groups has permissions to access the
      object.
    - For this to work, the subject (individual) needs to be
      authenticated by a secure server, and their role membership needs
      to be evaluated
      - That then needs to be compared to the ACL to see if they have
        access

* Nondiscretionary Access Control (NDAC)

  - Also controls authorization
  - NDAC is different from DAC because of who can manage the permissions
    - Only the admin or a small mgmt body can control permissions to an
      object
      - This control is systemwide and imposed on many subjects and
        objects
    - Can be installed on many OSes or configured in existing DAC
  - Offers a high degree of protection, but it restricts autonomy and
    involves a lot more administration

* Mandatory Access Control (MAC)

  - Is a form of NDAC
  - Restricts access based on information sensitivity
  - Privileges and formal authorization are still required to access
    objects
  - A single admin body is required to control access as MAC is born
    from NDAC
    - This body provides priviledge and authorization
  - Access is 'multilevel' as information sensitivity is different per
    classification
    - Top Secret data can be viewed by one group, Classified can be
      viewed by another.
  - Information must be PROPERLY CLASSIFIED in order for MAC to be
    useful as an Access Control scheme
  - A common implementation of this is to use Rules to assign the right
    data to the right classifications

* Role-based Access Controls (RBAC)
  - Focus on the job role/function that a person is in to be able to
    assign permissions to objects
  - The role a person is placed in will determine how much trust you are
    giving them
    - i.e. `User 5 -> Store Manager Role` will grant User 5 all the
      permissions that the `Store Manager Role` has
  - Users -or- services can be given Roles
  - Underlying access is granted based on Roles
    - RBAC works with the other AC models and simplifies management
  - This model (RBAC) can work with DAC, NDAC, and MAC

#### Accounting (Auditing)

- Measure activity that happens on a system
  - Who changed what, who accessed what
  - Keep historical access records
  - Records can be used to detect anomalies
  - Records can assist us if we have problems

##### Logging

Audit logs must be stored, and enough resources must be allocated to
create, store, and review logs.

- Resources
  - Create
  - Store
  - View

- Log files alone do not create security
- All critical transactions should be logged

###### Logging requirements

- Who is performing the action
- What action is being performed
- Where is this action being performed
- When was the action performed

#### Non-repudiation

Non-repudiation is being able to prove that a person IS THE ENTITY that
performed an action.

i.e. It is impossible for them to 'repudiate' (deny) that they 'took a  
cookie from jar 28 at 9am on Monday'

If a change happens in an information system, we need to be able to  
apply corrective action to the right person!

- Audit logs must capture enough data (who, where, when, what)

##### Identification

The identification mechanism (aka auth mech) needs to be accurate so  
that someone can't impersonate another user and circumvent  
non-repudiation.

Uname+pw CAN BE IMPERSONATED if someone gets the password of another  
user... All we 'know' at that point is that SOMEONE who knows
`steveba:p@$$w0rd!` logged in at 1am on Friday, not necessarily Steve
Ballmer.

Adding something like a retina scanner requires you to physically be in
possession of the eyeball to authenticate, so you'd need Steve's eye to
log in, which may be harder than getting his credentials.

The easier it is for someone to bypass an authentication mechanism, the
easier it is for the OWNER of a potentially compromised account to
REPUDIATE (deny) any action performed using their account.

"Hey, it wasn't me! My login got stolen"!

versus

"Hey, it wasn't me! My eyeball got stolen"!

- After logon, audit logs must record what actions are performed by who
- Identification of the user will only be as good as the auth system we
  are using

##### Requirements

- Accounting requires a lot of extra space and resources
- Consider security requirements carefully instead of logging to the
  finest level by default
  - Security Requirements
    - Subjects
    - Objects
    - Events
- Complete non-repudiation needs:
  - Logging all actions, subjects, etc
  - LARGE amount of data
  - Likely unnecessary
    - Should focus on critical data

There may be OTHER EVENTS that you need to log in order to protect
critical data -- Things that are not directly related to critical data.

An example of this is somebody who creates a new user and adds them to a
new security group, which could allow a nonpriviledged user to gain
access to critical data by using a different account.

All changes to security groups and users should be logged, as well as
access to data.

### Security Design Principles

These are key components to maximize software security against  
disruption and attacks.

#### Least Privilege

- Fundamental approach
- Minimal access rights
  - Minimum amount of time
- Useful for administering a system
- Limits harm if something is compromised

This is a fundamental approach to security.

Essentially, grant the MINIMUM amount of privileges to accomplish a task.
No more is given.

For a person, this means they get the absolute minimum perms and time to do a task.

Example: An admin's only job is to take and maintain backups. They should be able to back up the 
system, and nothing more.

Least Privilege is a good technique because it minimizes the potential for harm if a person,
credential, system, or anything else were to be compromised.

Often times, data loss is actually due to user error, not malicious intent. LP minimizes this.

##### Need to Know

- Military sec rule
- Limits disclosure of info
- Increased confidentialiy
- Mitigates Risk

Least Priviledge also means that disclosure of data is only given to people
who NEED ACCESS to the data.

This is a basic military security rule and it helps to limit the spread of critical info.

- Who NEEDS to work with this data?
  - versus 'who is ENTITLED to this data', which spreads more info than necessary

This increases confidentiality of the data, which mitigates risk, as LESS PEOPLE 
have access to the data.

##### Modular programming

- Software design technique
- Software is broken into submodules
- Every module has ONE job/operation

Software design can benefit from Least Privilege.

Modular programming breaks a program down into submodules.

Each module can have some least privilege applied to it.

Software becomes easier to:
- Read
- Reuse
- Maintain
- Troubleshoot

##### Non-admin accounts

Using nonadmin accounts, we can implement least privilege.

- Minimal set of rights
- Avoid a 'sysadmin' account existing (root, SA, admin, etc)
- Reduces risk

#### Separation of Duties

SoD means we NEED more than 1 person to complete a task.

- No single 1 person can fully abuse a system
- <https://en.wikipedia.org/wiki/Two-man_rule>
- Never give 1 person full control over a system
- Important in critical business areas
- Checks and balances

##### Software

- Common in software components
  - Ensure system checks and balances are performed
- Multiple conditions must be met before an operation can complete
  - i.e.
    - Does the user have permissions to invoke an operation?
    - (if the software is modular) Is the model requesting the operation allow to make that request?
    - Are the correct security protocols, like encrypted comms, in place?
- SoD in Software says that these checks and balances must be completed by different parts or modules
  within software, so each component is fully responsible for its own task
  - Each module has 1 job and must do it well, which minimizes risk to other components
- Code must be reviewed and tested to ensure each module performs properly
  - The code author MUST NOT review their own code. 
    This could allow them to insert malware into their code easily.
    - A different set of eyes will reduce bias and mistakes introduced by 1 person.

#### Defense in Depth

- One of the oldest security principles.
- Layering security controls to provide multiple defenses
- One single vulnerability will not result in a compromise
- Strong external network and a weak internal network...bad!
  - One hapless employee with a virus on their laptop can defeat the strong external defenses.
- Not just 1 strong firewall will protect you.
- Layers should be DIFFERENT.

##### Diversity

- Security layers should be heterogenous
- Mix protection
  - i.e. Input validation AND stored procs
- Wider range of security
- Deterrent and mitigation of risks
  - Effort to breach a system is a great way to make it a PITA to penetrate

#### Fail-Safe, aka Fail-Secure

- Systems should fail to a 'safe state'
  - A state that will not allow it to be compromised (at all, or further)
    - Don't do a memory dump!
    - Reboot > Login as Admin
  - Vehicle crash detection
    - Door unlocked
    - Engine stopped
  - Suppose a user attempts to log into a system
    - Bad password:
      - Error says "Login Failed" and not "Bad Password"
      <!-- - **It's Just Good InfoSec Bro &tm;**  -->
      - "Login Failed" is nondescript, IDK if the uname or pw is invalid.


- Rapid recovery upon failure
  - Failover server/module
    - i.e. <https://success.docker.com/article/dr-failover-strategy>
- Resiliency
  - Confidentiality
  - Integrity
  - Availability

- Fail-safe is part of the SD^3 initiative
  - Secure by design
  - Secure by deployment
  - Secure by default
    - \*Should be secured during every point in deployment
    - \*No default passwords
    - \*No extra default features

#### Economy of Mechanism

EoM is a phrase used when trying to implement functionality while keeping the implementation as simple as possible, but still trying to maintain the functionality.

- Usability vs Security
  - Generally opposing forces within an org or software system
  - Add a lock to a door on a room
    - Now everyone who needs access has extra steps
    - Takes time to lock/unlock the door
    - Admin duties now exist regarding assigning keys or changing the lock
    - Applying EoM to this example will have us use RFID cards instead of keys as they are
      easier to manage and are more convenient for users.
        - We still have the desired effect but the IMPLEMENTATION is different

Sometimes, more features are crappy hacks built on existing systems. This creates a more complex system that could hide security holes.

- Avoid unnecessary complexity
- KIS,S
- Operational ease of use with simplicity
- Fewer inconsistency

##### Requirements Traceability Matrix

EoM can be hard to understand and harder to implement.

A RTM can help you understand it.

- Generated during the requirements gathering phase of a project
- RTM is a document that tracks the requirements of software and
  matches it to the implementation components
  - This lets us compare what is being created and how it covers the requirements of the project
  - We can use this during the development phase to track and manage software functionality
  - Prevents inclusion of unnecessary functionality

Example: <http://doliquid.com/wp-content/uploads/2017/12/requirements-traceability-matrix-template-best-business-template-regarding-requirements-traceability-matrix-template.png>

#### Complete Mediation

- Access requests must be verified EVERY TIME someone accesses a system
  - Lots of systems actually don't do this

1.  Log into website
2.  Do something
3.  Must log in again
  1.  Each request is A&A (authenticated and authorized) individually
4.  This is a Gigantic PITA Bread

More practical approach is to use a Smart Card for authentication

- User needs to keep card inserted, not type `P@%$$w0rd` 2315 times.
- Authorization is NEVER circumvented
- Verify every single request
- This model enforces systemwide access control
  - When a user authenticates, the same authentication happens to the same 
    user account at each stage of the process
    - This means each component needs to use the same authentication mechanism.

This greatly reduces the possibility of a system exploit as any exploit would be forced to re-auth.

##### Caching

- Using CM is not common
  - jsessionid, anyone?


- Caching greatly speeds up software
  - Increase to security risk
    - Auth bypass
    - juicy session token gets stolen (session hijack)
    - MiTM
    - Replay attack
- The longer creds are cached, the greater this window of opportunity is.

#### Open Design

...AKA 

"security through obscurity S.U.C.K.S. and your crappy custom XOR 'encryption' protocol is a pile of duct tape and cardboard and would be torn to shreds by any hacker who found out it was being used"

Open design is the act of making a system and publicly releasing the source code.

- Depending on the secrecy of your design is a bad idea
  - Enables backdoors, poor testing, and shallow defenses

This enforces the idea that implementation details should be independent of design

- Looking at you, hardcoded password/server name/connection string/IP address
  - These would not be included in the design, and thus the shared source code

This permits craploads of people to review the software. And because there are no embedded passwords/ips/etc, the act of reviewing the software will not compromise any defenses.
- Public bug issues
  - Faster resolution
  - HOWEVER, public bugs become PUBLIC KNOWLEDGE immediately
    - 0days :3

Because of the bug problem, OD is not a universally accepted practice.

##### OD Crypto

Crypto is one of the best examples of OD in practice.

Crypto is Math that cannot have ANY flaws or it will crumble.

There are loads of crypto algs, some have been blown to bits (i.e. DES's keys are too short) but others are good (i.e. AES)

<https://en.wikipedia.org/wiki/Kerckhoffs%27s_principle>

"A cryptosystem must be secure even if everything about the system except the key is known."

or,

"Assume the enemy knows the system".

This is an antithesis to "'security' through obscurity", which has been proven to breed awful \(in\)security.

Example: OD was NOT applied to the Content Scramble System to encode DVDs in the 90s.

<https://www.cs.cmu.edu/~dst/DeCSS/Kesden/>

They relied on a SECRET ALGO that was exploited because it was weak.

##### Moral

Do not rely on the mechanisms that you deploy to be secret.

Secrecy does NOT bring security.

Public scrutiny fixes issues faster than without.

#### Least Common Mechanism

Restricting multiple users from sharing the same "mechanism", i.e. a common component in a system.

If 2 users both access the same app on the same server, then the 2 users have multiple mechanisms in common like:

- Web server
- Application
- Network comms

This means one user can accidentally or maliciously access the private data of the other user.

LCM (Least Common Mechanism) refers to separating these environments as much as practically possible to separate data and controls.

- Sharing opens channels to transmit information
- To implement LCM principle, common mechanisms must not be shared
- Mechanisms that must be separated:
  - More than 1 user or process
  - Different levels of privilege

Example:

1 normal user, 1 manager user.

If we add mgmt functionality to an app that both users use, then the normal user might gain mgmt functions.

If we apply the PoLCM (principle of LCM), then we might want to make 2 different applications.

Session hijacking highlights why the PoLCM is important: It would mitigate it greatly.

- Web server is shared
- Network is shared
- Hundreds of users pass a session token back and forth
- Might be admins/mgrs using the same web server as normal users

#### Psychological Acceptability

Psychological Acceptability is abut recognizing that humans are involved when working with computer security.

This can be hard as all people behave differently.

Ex: Long and complex passwords are more likely to be written down near the computer, and therefore this requirement, while technically secure,
may effectively decrease password security, and piss off users.

Security mechanisms should not make resources more difficult to access. Each layer of difficulty will only encourage users to circumvent them.

Security mechanisms should be transparent, but are rarely transparent.

Complexity of configuration also may lead to insecure software. The harder it is to configure software, the easier it is to misconfigure.
- Configuration should be as easy and intuitive as possible.

Outputs must provide understandable errors.
- No privileged information should be given.
  - 'incorrect creds' vs 'incorrect password'
- Properly described incorrect parameters or errors.

#### Weakest Link

The Weakest Link is the most easily compromised point of a piece of software.

The WL (Weakest Link) is how resilient the software is against a hacker.

The hardest part is actually identifying the WL. Many admins who respond to breaches had no idea the hole existed in the first place. They probably don't monitor or audit either.

It's also important to consider what results in the LARGEST vulnerability (a combination of scope of impact once breached PLUS ease of performance of vulnerability)

- What software components could be breached?
  - Code
  - Services
  - Interfaces

A common mistake orgs make is ONLY focusing on user interfaces and ignoring other possible routes of exploit, like backend services or hackers editing code.

ANY type of break in the weakest link means a breach. WL is a component that CANNOT be compromised -- Some can, and don't impact much of other systems.

#### Leveraging Existing Components

Adding new functionality or writing new code can introduce security vulnerabilities.

Existing components should be used/reused to ensure attack surfaces are not increased, assuming the existing components have already been audited for vulnerabilities.

Q: Do we introduce the functionality as a separate component, or as a change to an existing component?

A: We need to balance EoM (Economy of Mechanism), which is about keeping things simple, with adding new functionality as a new component.

If adding new functionality to the system is MORE COMPLEX than modifying an existing component, we should do the simplest thing! And vice versa.

Keep in mind that any changes to an existing component should be audited.

For example, databases should be leveraged instead of rewriting the database system.

As always, changes bring security issues, and pro/con assessments must be made.

### Privacy

#### The Privacy Principle

Privacy is about controlling the information about something -- Allowing the user to control how information is shared.

This is an important topic and often controlled by law.

- Who is it shared with?
- Why?
- How will it be transferred or used by the 3rd party?

"Traceable sharing" is a way for a user to share information with another party, but it possible to track where the information was divulged.

- ex: Credit card purchase on a site
- We can also verify it is used correctly

Unfortunately, a lot of the time, we can't know how the third party is using the data -- It isn't traceable. We are just trusting them.

##### Data Disposition

Data Disposition is the long-term use of data.

ex: Credit card purchase.
- Do we retain their address? CC#?
  - We are obligated to administer their data according to our policies

If the data that we store is compromised, we will become liable, or lose customers (or piss them off!)

*cough* EquiFax *cough*

Also, using customer data in a test environment is a bad idea:
- Discloses it to all your devs
- Duplicates it across an entirely new system, 'doubling risk'
- Test environments are generally less secure
- Data should be anonymized first
  - Name, address, CC# should be replaced with random data.

#### Privacy Considerations/Privacy Policy

A Privacy Policy is a high-level document that details the following about private information:

- Collection
- Use
- Transfer
- Storage

This document is used to identify what information needs to be safeguarded, how, and the details.

It can also be a guide for employees.

Part of a Privacy Policy is to have a Privacy Disclosure Statement, a public version of the privacy policy, so external parties can understand how data is used and protected.

##### Identifiable Information/PII

Identifiable Information (II/PII) is information that could be used to identify a person.

- Name
- DoB
- Birthplace
- Address
- TIN/SSN/NIN
- Motor Vehicle/Driver's License
- Genetic info/face/prints
- IP Address

It doesn't take a lot of info for data to be considered PII.

###### Protected Health Information

(PHI)

- Demographic data
- Biometrics
- Medical History
- Test data

This area of data is protected by HIPAA/HITECH Acts.

Storing info under this category MUST be protected according to legal mandates.

##### Breaches

Since you are storing PII, you must monitor for breaches.

Lots of companies only take action AFTER a breach is detected, or even worse, never find out a breach occurred because there was so little monitoring.

Security controls must be put in place to:

- Detect a breach
  - What happened
  - How did it happen
  - What data was compromised
  - Will involve logging and auditing

Data should be encrypted so that data cannot be read w/o decryption, which could take years or more.

Some legislation dictates long term data protection guidelines.

#### Protection Principles

In Europe, the EUDPD, or European Union Data Protection Directive, dictates how data is protected.

- Any data collected can only be used for approved purposes as dictated by the owner of the data
- Destroyed after a period of time or rendered nonidentifiable
- Data should not be processed, unless:
  - Usage is transparent (user gives consent to processing)
  - Purpose of processing is legitimate
  - The level of data collected is proportional (appropriate) to its purpose.
    - Helps stop orgs from collecting unnecessary data

#### Safe Harbor

Due to the EU/US differences in data laws, a set of "Safe Harbor" rules were made.

Data can be transferred from Europe -> US, GIVEN THAT:
- Notice
  - Customers must be informed of how their data is collected and used
- Choice
  - Customers can opt out of the transfer or sharing if they choose to
- Onward Transfer
  - Data can only be transferred to third parties who follow data protection principles
- Security
  - Reasonable efforts must be made to protect the data
- Data Integrity
  - Only the data that is required is transferred, and it's used for the purpose it was collected for.
- Access
  - Customers can access their information and correct/delete it.
- Enforcement
  - There's an effective way to enforce these principles

### Risk, Governance, and Compliance

#### Regulations and Compliance

##### Federal Information Security Management Act (FISMA)

This act governs the security of Federal Information Systems and ensures that periodic risk assessments are completed.

- Policies and procedures are in place to mitigate assessed risks
- All subordinate levels (facility access, information systems, etc.) have appropriate security planning
- Staff are properly trained
- Policies are periodically tested and evaluated to ensure their correctness
- Remedial processes are in place to...
  - Implement, document, and evaluate remedial actions
- Planning is done
  - Disaster recovery
  - Etc

###### Identification

Classifying data is IMPORTANT to apply the right level of security to data.

FISMA asked NIST to determine the standards for classifying data within federal agencies.

- Standards
- Guidelines that govern what classification is applied to what data
- Minimum security requirements for each classification

Result of this: NIST made FIPS 199, FIPS 200 publications.

<https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.199.pdf>

<https://csrc.nist.gov/csrc/media/publications/fips/200/final/documents/fips-200-final-march.pdf>

##### Sarbanes-Oxley (SOX)

SOX is an act that governs corporate financial practices in reporting.

- Created in 2002 after a bunch of corporate financial scandals
- Includes:
  - Public Company Accounting Oversight Boards
  - Enhanced Financial Disclosure and Reporting
  - Corporate and Criminal Fraud Accountability
  - Corporate Tax Returns

SOX includes requirements for recordkeeping and reporting of financial data.

Any system that maintains this type of data must comply with SOX.

##### Health Insurance Portability and Accountability Act (HIPAA)

- Governs the security and privacy of health information

It also governs any org that collects health information.

- Final Security Rule
  - Categories:
    - Protection of transmitted data
    - Data at rest
    - Physical protection
    - Administrative procedures
  - Standards
    - Administrative
    - Technical
    - Physical safeguards
- Final Privacy Rule:
  - An entity (like a healthcare provider) can use any information disclosed to it for its own treatment, payment, and healthcare operations within the organization.
  - Covers issues like notification to patients, prohibiting sale of PII, passing health info to researchers (and how), etc.

##### PCI Data Security Standard (PCI DSS)/Payment Processing

Payment processing is also regulated, through a standard called the PCI DSS.

This standard is used by the PCI (Visa, Mastercard) for the protection of cardholder data and transaction protection when processing transactions like credit card payments

The PCI DSS is broken down into a lot of areas that govern building and maintaining secure networks.
- Build and maintain secure networks/systems
- Protect cardholder data
- Maintain a vulnerability management program
  - Antivirus
- Implement strong access control measures
- Regularly monitor and test networks
- Maintain an Information Security Policy

The DSS is applied to all parties involved in processing.

- Merchants
- Processors
- Acquirers
- Card issuers
- Service providers
- Anyone else who stores, processes, transmits cardholder data.

Credit card fraud is very common, so these regulations make sense.

#### Legal

##### Patents

A patent is a set of exclusive rights granted by a government to an inventor or assignee.

These rights are granted for a specific period of time and are to protect the inventor's rights, so noone else can claim it was their invention like selling it w/o the patent owner's permission.

Patent law varies between countries and can be complex.
- What is patentable?
- How long can it exist?

To get a patent, the owner of the work will need to apply for a patent with the government.

##### Copyrighting

This is another way to protect IP rights.

- Gives a creator of original work the exclusive rights to it.
- Copyrights are applied to any expressible form of an idea or information that is substantive and discrete.
  - Covers
    - Creative
    - Intellectual
    - Artistic

Different from a patent because patents usually don't cover ideas, but focus more on inventions.

Copyrights are governed internationally through the Berne convention.
- Countries that are a part of the convention must recognize each other's copyrights

Depending on the country, copyrights are automatic or must be applied for.

For countries part of the Berne convention, copyrights are automatic. However, you must be able to prove that the work was created by the owner and WHEN it was created.

If an owner of a work thinks their work was copied, in most countries, it is up to the owner to pursue it in court.

##### Trademarks

A trademark is an identifiable quality used to identify products or services from an organization.

This is usually used to protect an org's brand. Logos are usually trademarked.

Trademarks can be made via...
- Common law
- Registration
  - Registration provides the owner a lot more legal protection and the ability to recover more damages if they are incurred

Internationally, trademarks are managed through the World Intellectual Property Organization.

##### Trade Secrets

These protect a secret for a specific amount of time.

- Very tightly controlled
- Offer a lot of protection
- Usually food
  - ...szechuan sauce!!!!
  - Coca Cola

This is difficult to use in Software though: If another party develops similar software INDEPENDENTLY, it is no longer a trade secret.
Example: Using a shopping cart on an ecommerce site.

##### Warranty

This is a protection of a consumer that ensures a product or service will work as advertised, or else they are reimbursed in some way.

- Minimum legal protection for consumers
- Protection:
  - Quality
    - No poor quality
  - Safety
  - Performance (performs as advertised)
  - Durability
  - Defects

Software generally comes with NO warranties...

This means that if you buy software with security holes, there may be no recourse for the consumer to pursue the software retailer for damages...

#### Standards

Standards are not necessarily the most common way of doing something.

Standards are a defined level of activity, usually measured by a third party! A third party must be able to say if you meet a standard or not.

Benefits:
- Can compare 2 organizations
- Can promote interoperability

##### International Organization for Standardization (ISO)

- Founded in 1947

ISO develops and publishes international standards that ensure products are safe, quality, and reliable.

There are over 19,500 standards published for tech, food, and health.

##### National Institute of Standards and Technology (NIST)

- US based
- Develops tech, measurements, and standards that align with the US economy
- Federal Information Processing Standards (FIPS)
  - Governs all nonmilitary gov't agencies and gov't contractors when specified as part of their contract
  - Crypto
  - Personal ident verification for feds + contractors
  - NIST SP 800 series
    - Research and guidelines on securing information systems
  - SAFECode
    - Non-profit, not related to NIST
    - Identify and promote best practices in software dev

#### Risk Mgmt

- Many models exist to model risk
- We'll look at a general model

Risk mgmt's goal is to assess and mitigate anything that could cause harm to the project or deliverables.

- Manage risk in general
- Manage risk through project phases

##### Step 1: Asset Identification

This is where we identify and classify all assets.

- Identify and classify
  - Assets
  - Systems
  - Processes

A common mistake is to only focus on assets we want to protect instead of ALL of our assets. When we do this, we miss protecting "noncritical" assets whose compromise may lead to larger issues later on.

Risks can be weighed by considering:
- Damage to business
- Damage to people
- Financial risks
- Etc

Scoring each factor helps you objectively determine where your priorities should be.

Then, prioritize assets.

Financial costs (lawsuits included) generally are weighted more.

We also need to evaluate the information criticality of the data. This refers to how critical the data is to the business.

For example, if someone loses access to some data, does the rest of business stop?

##### Step 2: Threat Assessment

- Identify threats
- Identify vulnerabilities
  - Exploitable vulns can be used to gain access to all sorts of things, so focus on them.
  - Vulns can climb 'priority ladders' to gain access to higher priority assets
    - Risk priorities must reflect this
- Threat = harm to an asset
  - 'Threat' includes...
    - Incorrect data entry
    - Insider threat

##### Step 3: Impact Determination and Quantification

What's is impact the loss/compromise of an asset would have?

- Determination of loss
  - Tangible (easier to quantify)
    - Financial loss
    - Physical damage
  - Intangible (harder to quantify, but do it anyways)
    - Reputation damage

##### Step 4: Control Design and Evaluation

What controls are needed to mitigate the risks and/or reduce the vulnerabilities?

Controls are countermeasures introduced to reduce/eliminate the risks.

- Controls
  - Actions
  - Devices
  - Procedures

They can be additional action that occur, physical/logical devices, or procedures that address specific risks.

For example, a website that lets you buy stuff with your credit card has the risk of credit card fraud.

One countermeasure could be additional security checks to mitigate that risk.

##### Step 5: Residual Risk Management

This step exists because risk cannot be fully eliminated from a system, and we need to accept that fact.

These remaining risks are called 'residual risks'.

We need to understand these risks to identify and introduce controls along the way to reduce these risks.

- Consider multiple controls to reduce risk

### Software Development Methodologies

#### Waterfall

```

Requirements \
             v
            Design \
                   v
                  Implementation \
                                 v
                                Verification \
                                             v
                                            Maintenance
```

This methodology is the first and most common development methodology.

It's based on a sequential set of phases that govern what's done in each phase.

It is the most used because it's the best known (and old AF.)

It came from the manufacturing process and is simple but NOT adaptive, which is a problem for software projects as requirements are known to change a lot.

Because of this, we need to repeat a lot of work to introduce new requirements.

Waterfalls therefore have the highest risk for increased time and cost.

##### Phase 1: Requirements

All of the requirements of the software are determined and presented as a deliverable.

Requirements are either:
- Functional
  - Describes the function of the system
- Nonfunctional
  - Describes the rest of the requirements that are related but don't fall under the functionality of the system
  - Restrictions are an example of a nonfunctional requirement

These requirements are passed to the next phase.

##### Phase 2: Design

In this phase, software architects blueprint the design of the software.

The "External Functionality" is how the software interacts with the outside world.

- External Functionality
  - Input
  - Output
  - Constraints

- Internal design
  - Algorithms
  - Data structure
  - Internal Routines

At the end of this phase, you should have clear documentation, which is the blueprint to move to the third phase.

##### Phase 3: Implementation

Documentation is used in this phase to start making the software. The software should not be difficult to create if the architects have done their job. The architects' documentation must be clear and concise

Unit testing should be introduced here as well, even though it is technically part of Verification.

At the end of this phase, software is done being created.

##### Phase 4: Verification

- Software is tested for bugs and errors in this phase
- Devs fix the software
- This repeats until bugs/errors are minimized

In a waterfall method, devs generally have to introduce A LOT OF CHANGES in this step. You can't go back, and all these changes have to be retested again.

Verification is the cycle that causes the majority of cost and time overruns:

    Step 4 -> A BUG! -> 1 -> 2 -> 3 -> 4 -> here we go again...

At the end of this phase, software is deployed.

##### Phase 5: Maintenance

The software has been deployed into PROD at this point. Hope that `drop from dbname` test that runs post-update was behind a conditional! ;)

Focus of this phase is to keep software up and running.

- Correct any unresolved or undetected bugs
- Fix the bugs
- Routine maintenance (backup, recovery, etc)
- This phase is active until the software is retired 100%.

This phase is the longest phase and is usually most expensive in terms of time and money.

However, most orgs don't include these numbers as part of the project. This is attributed to the cost of RUNNING the software and not the development, so the Implementation phase is usually recognized as the most costly and time-consuming phase.

The architect and developers should be creating software that is easy to maintain because the last 2 phases are so time and money consuming.

#### Agile

The Agile development methodology is a group of dev methodologies that share 'agility'.

When done right, agile methodologies are much better suited for software projects as they align with the short, iterative style of agile.

Software dev is always a work in motion and not a static, monolithic piece of work.

- Promotes flexible response to changes
- Adaptive Planning
- Teamwork
- Collaboration
- Adaptability
- Development

##### Scrum

<https://www.scrum.org/resources/scrum-framework-poster>

Scrum is a popular Agile dev methodology.

Focused on programming, and a 30-day release cycle. Even if the software isn't ready for market, it's maintained in a deliverable-ready state, which helps to test it.

- Simplified change mgmt
  - This makes Scrum unique.
  - Scrum focuses on sprints (30day) and scrums (24hr)

Sprints maintain goals over a 30day period, and the daily scrum serves as a way to manage progress per-day, so that everyone has daily goals.

Scrum also has processes to evaluate each sprint and introduce work back into the cycle.

If a bug is detected, it's added to a 'product backlog' and eventually picked up by a sprint to fix.

Scrum is popular because of its simplicity and clear understanding of progress being made during the dev cycle as small changes are tracked.

##### Extreme Programming (XP)

```

      Planning -------------- Iteration
          \                      /
           \                    /
            \                  /
             \                /
              \- Acceptance -/

```

This methodology focuses on 'user stories' and is useful for smaller dev teams.

'User stories' are a way of describing a user's interaction with the software as they do a task. This helps provide requirements of software.

These stories are handled by the team to finish the project with small changes.

The iterative model in XP follows a feedback model that allows for feedback and acceptance to repeatedly come back into planning.

In the real world, a lot of orgs lack experience and understanding to properly implement Agile dev methodologies, fail, and return back to waterfall.

Agile has significant advantages over waterfalls, so understanding the methodology is important so that you know if it's being implemented correctly.

## Secure Software Requirements

These integrate security into the software dev lifecycle.

### Policy Decomposition

Policy decomposition is one of the key components for aligning policy statements.

Security policies are composed of both internal and external requirements.

#### Internal Requirements

- Proper protection for audit/data logs
  - Logs contain a lot of important information
    - Account names
    - Server names
    - Names/IDs of processes
  - Audit and data logs must NOT be tampered with
    - This is to ensure non-repudiation
      - We can ensure that one individual performed a specific action
      - If someone tampers with an audit log, we can no longer ensure that any specific individual performed a specific action
  - Data loss!
    - Data loss usually comes from IMPROPER HANDLING, not data loss

Every security policy needs to ensure data is handled properly.


- Managing Data Loss Prevention (DLP) elements:
  - Governance policies
    - Data is handled properly by the correct people 
  - Risk assessment
    - How likely is it for data loss to occur?
      - What happens when data loss occurs? 
    - Rank threats, likelihood, and response to a threat occurring
      - Create appropriate response plan, don't over/under-respond
  - Compliance
    - Compliance with DLP means we comply with business/legal requirements with respect to data
      - i.e. legal req to retain 7 years worth of data...The security policy needs to ensure we meet these legal obligations for the lifetime of the data
  - Classification
    - Data is properly identified so we can put the correct security controls around the correct data
      - i.e. CC# or PII should be more protected than a product catalog
  - Policies
    - Governance and compliance are key factors in determining an organization's policies
    - The high-level policies of an org are generally made up of (or mapped to) a lot of smaller, simpler policies
    - Policies such as 'who can modify data' can affect the integrity of that data
  - Discovery
    - Data within an org gets copied, duplicated, and edited very fast
    - Discovery allows us to find data in an org that needs to be protected
  - Remediation
    - Sooner or later, we will not be compliant with policies
    - Remediation lets us determine the course of action to take
    - i.e. if we discover someone gets unauthorized access, we review the audit logs to determine if they actually used that privilege.
  - Awareness
    - Everyone enforcing security policies needs to be aware of the policies that they need to comply with
    - We also must be aware of whether or not we are compliant with the policies
    - Monitor internal system traffic, and internal controls, etc.
      - Collect evidence of whether or not we meet the requirements of our policies
      - What system traffic/controls do we monitor?

#### External Requirements

These address all of the security issues/requirements that are outside of our organization, like external vendors, gov't, and even WFH (Work From Home) employees.

- Protect all external connections
  - Security controls
    - Enforce compliance upon connections
      - i.e. all extern access must be done via VPN
    - Our security policy must dictate what types of connections are allowed, who is allowed to use what type of connection, and details of security requirements of each connection, like the level of encryption.
    - Once an external connection is made, access must be restricted only to the services and components that that person has permissions to access.
  - Authentication
    - Minimum levels of auth and what protocols we support
      - This may bar devices from connection, which may or may not be acceptable.
    - Account policies to protect against things like bruteforce

How do we mitigate web-based threats?

When a client/employee, who SHOULD be listening in that morning meeting, goes to hxxps://www.mycoolguns.ru/, they're downloading HTML/CSS/JS/etc from that site and bringing it to an internal website.

The security policy has to address the requirements to do this safely and within policies.

- Content filtering
  - Restrict known dangerous sites (blacklist)
  - Could use a whitelist (can be very restrictive)
  - Could block specific filetypes (.exe)
- Proxies 
  - An external computer (mycoolguns.ru) should never have direct access to an internal computer (Bob's laptop)
  - Proxies hide a client's connection to a webserver by forwarding requests...mycoolguns.ru only sees the proxy IP and whatever else the proxy chooses to forward/not forward
  - The external webserver will never have direct contact with the client

### Data Classification and Categorization

These determine how data will be handled during the development process.

#### Data Classification Part I

One of the most important aspects of building a secure system is how data is classified.

Data is the key asset of an enterprise. All systems around it are there to manage it. Without data, how can money be made, or actions be executed?

- Enterprise data flows throughout an organization
  - Data flows are complex
  - Maintenance and management can be difficult

Data flows through enterprise. We need to know how so we can put security measures in the right places.

- How does data come in
- How is it stored
- How does it move between internal and external systems

If data enters via a website, the way the CC# is communicated is likely different than how we communicate that info to a bank for authorization, which means the security requirements will be different for those 2 scenarios.

- To help manage complexity of data flows
  - Data is classified and labeled
  - Responsibility for management is identified

We must identify data that has the same security requirements: SSN, CC#, etc.

- Data can be classified by its:
  - State
    - How data flows
    - CC# needs to be used to authorize a purchase, and communicated to a bank
  - Use
    - i.e. CC# needs to be transmitted over this medium
  - Risk impact level
    - What does it mean to our org if this datum were compromised, and what is the possibility of that happening?
    - What does it mean if this (or ALL) CC# were leaked?
      - Short-term business
      - Long-term business
      - Legal implications
    - By identifying both risk level and impact level, we can focus on the most important thing. We would want to protect the most high-risk, high-impact data as opposed to low-impact, low-risk data, etc.

- Data can exist in any state at any time, like/because of/in the form of:
  - Storage
  - Creation
  - Transmission
  - Modification

These are all important aspects as data can be spread across so many different systems (physical/logical/network) because of this.

- Data location/hosting is IMPORTANT
  - Physical, permenant media
    - Hard Drive/CD,DVD
  - Remote media
    - USB, cloud/hosted storage
  - RAM
  - These all impact security requirements. Policies for portable device encryption? Hacked systems java mem dump? Etc.

#### Data Classification Part II

- Classification of data can also be determined by its usage
  - How does data align with business needs?
  - How shareable is it?

CC#:
  - Who needs to read or edit it?
    - This determines who has perms to do it and when they can do it

Data with the same shareability and business needs should be classified together.

- Is the data:
  - Internal
    - It has been created and used WITHIN an application
    - Generally hidden by a system
  - Input
    - This data is read INTO a system
    - Classified as input data
    - Data can be given by a user or third party
  - Output
    - Generated by an app after being processed
    - i.e. a report
- Additional attributes:
  - Security-sensitive
    - This is data that is of high value to an attacker
    - This category is NOT the same as high-risk...
  - Personally Identifiable Information (PII)
    - CC#, TIN, SSN
    - Address, phone number, IP
    - These are protected by LAWS, and care must be exercised.
    - Customer/employee (*cough* EquiFax *cough*) leaks can destroy lots of parts of our business
  - Should be hidden
    - Any data we wish to conceal from the public or users
    - i.e. a database connection string used by an app to connect to its DB.

#### Data Ownership

Who owns the data?

- Data is owned by the organization
- To assign responsibility, we think that data is 'owned' by specific employees
- The owner is responsible for the data.
- Data could be assigned to users who are considered to be stewards of the data
  - A steward takes care of the data from day-to-day
- Role determination is dependent on the type of data as it relates to business needs


- Data owner
  - Determines who has access to the data and what level
    - R/W, change, delete
  - Defines:
    - Classification, authorized users, access rules, security controls
- Data custodian
  - Directly interacts with data
    - Responsible for fulfilling the data owner's requirements
  - Maintains:
    - Security controls, Access controls, authorized users, data backup; retention; and disposal.
  - Data custodian has many responsibilities, you will see many organizations separate these responsibilities among multiple custodians.
    - Custodian A does backup
    - Custodian B manages authorized users and their perms

#### Labeling

Labeling data is about adding extra data (metadata) to describe the data that we're protecting.

Example of the importance of labeling is a file called `README.txt`. What's the file about? What info does it have? Who should have access? Does it contain confidential info? Is it an original or a copy?

- Enterprise data retention can be extensive, depending on policy.
  - How do we know something must legally be retained?
- Difficulty is identifying which data must be retained, and by what policy.
- Appropriate data labeling ensures that proper handling is performed
- Data sensitivity can be defined by job role and/or business reasons for the data existing
  - If an employee has a legit business need to use the data, they should be given access


- Improperly handled data and its impact organizationally is MORE IMPORTANT than data sensitivity
- All data should be classified by its impact
  - High
  - Medium
  - Low
- Delineation determined by impact to...
  - People
  - Customers
  - Financials

Example: Flight data for large airliners is transmitted WIRELESSLY to the flight computers onboard the airplane.

Any improper handling of this wirelessly-transmitted data could compromise the flight systems onboard the airplane.

The impact could be ~80 dead people, so pretty high. You'd also lose a lot of customers and lots of money.

This data is High, and must always be protected, never mishandled.

#### Data Types

##### Structured

Examples:

Charts:

<https://www.bls.gov/cps/employment-situation-covid19-faq-june-2020.pdf>

MS Access databases:

<https://docs.microsoft.com/en-us/dotnet/framework/data/adonet/sql/linq/downloading-sample-databases>

The data fields are separated by special delimiters:

| id | fname | lname | address         | phone        |
|----|-------|-------|-----------------|--------------|
| 0  | henry | post  | 123 example ave | 123-456-7890 |

...etc...

Data is also restricted in some way, i.e. the `id` field can only accept numbers, maybe the `phone` field can only accept hypenated numbers, etc.

<a href="/feed.xml">Structured data could also be XML files.</a>


This one looks like:

```
<feed>
  <entry>CONTENT...</entry>
  <entry>CONTENT...</entry>
  <entry>CONTENT...</entry>
  ...
</feed>
```

##### Unstructured

This data is (probably) data you're the most familiar with.

<a href="/interests/">Click this for an example of unstructured data.</a>

Emails, word documents, reports, essays, letters, ...paintings, etc. are all unstructured data. That machines do not know how to process. You can write whatever you want in an email or essay, especially a word document, ESPECIALLY a powerpoint.

There are no restrictions or requirements in these media.

#### Data Lifecycle

All data has a lifecycle.

Created, used, stored, destroyed.

All data follows this pattern, and your data (yes, even SSNs and CC#) will go through this cycle.

When data is created, how does confidential data move between a customer and our organization securely? During the time we have the info, we must protect it, and it is also our organization's LIABILITY.

This means we also have to DESTROY it, if we do not need it. We should, too.

- Data lifecycle mgmt is a data owner's responsibility.
  - Also responsibility to define level of importance and retention that a set of data should have
  - Retention impacts the data lifecycle 
    - A policy that requires 7 years retention means we have to be responsible for the data for at least 7 years
  - It is possible for data to pass from one owner to another in complex scenarios


- Data lifecycle can be broken into:
  - Data generation
    - Importance lies in persistent data
    - Classification, protection, and destruction policies are assigned. Very important.
  - Data retention
    - Data owner and custodian responsibilities are defined
    - Protection levels and duration of storage are defined
    - Stewards and owners are responsible for the data now
    - Not only logical, but physical measures (backups, etc) should be enforced to keep in compliance with policy
    - How many different places are our data stored? Backup!!! Also, compliant (maybe encrypted) backups!
  - Data disposal
    - Conserves resources
    - At EOL, data custodian removes data from ALL sources.
    - Failure to observe this may cause us to forget about the data and cause it to be compromised.
    - It is common for old data to be forgotten about, mishandled, and then compromised, leading to negative effects.
    - When disposing of data, ALL SOURCES that contain it must be dealt with, and this includes backups.

### Functional Requirements

Functional Requirements define how software is expected to operate.

#### Role and User Definitions

- Review roles and user definitions, and how they relate to functional requirements

When making software, one of the first criteria is:

- Functional software 
  - (it works)
  - Meets all of the functional requirements

- Functional requirements define the expectation of software functionality
  - They are driven by business requirements

- We may be building software that multiple business units use, and therefore they may have different requirements. Might conflict, even.

However, all organizational requirements are ultimately used to create the functional requirements our software needs.

Once we know what our software will do, we can then understand the roles and users that are allowed to use those functions.

This way, the right people get access to the right functions.

- Role and user definitions will outline who does what
  - What group can use a system
  - Job roles further define specific functions
  - It's common to see role definitions line up with org job definitions
- A comprehensive listing of users and their functions outline part of a 'use-case' definition
  - Use cases are part of the UML standards
  - It's a diagram that helps define each function within a system and who (users aka actors) can interact with those functions
    - It also describes the details of a function and what it does
- Users are called 'subjects' in comp sci terms (subject-object matrix)

#### Deployment Environment

- We need to consider other things that are maintained to create software, such as the development environment, test environment, and deployment environment.

Deployment env can be complex as software generally communicates with one or more other systems, and relies on core components.

This env is not straightforward.

The software dev lifecycle should follow the SD Cubed principles, or SD3.

- Secure by design
- Secure by default
- Secure by deployment
  - Software that's the first 2, but not secure by deployment, can be compromised DURING deployment. Pbllllt.

Software deployment in the environment relies on conforming to:
- Maintainability
- Data access
- Access to essential services
  - Auth like active directory

- Functional requirements for system deployment must be detailed
- Defining, understanding, and conforming to all infrastructure requirements allow for:
  - Seamless interconnectivity between disparate systems
- Example of infrastructure requirement is that our org uses IPv4. Any comms must use IPv4 and comply with this infra requirement.

##### Requirements Traceability Matrix (RTM)

![](/static/images/2020-06-15-CSSLP-notes/requirements-tracebility-matrix-example.png)

An RTM is used to track and manage all functional requirements as well as implementation details.

It also lists validation criteria, which are important b/c they let us ensure we're meeting those requirements.

RTM is really a documentation tool to help manage a list of requirements that helps us ensure every requirement is met, and prove that they are met.

#### Objects, Activities, and Actions

Objects are anything a SUBJECT can interact with when operating a system:
- File
- Database record
- Program element
- The system itself

We need to understand these objects because we must determine and control who has access to them, what functions objects allow, and who can access the function.

- Object access is controlled by implementing access control lists (ACLs)

Example: We have at a file. We need to control who has access to the file. Reading it, editing it, etc, need to be controlled.

Disk drives are also examples of objects. Perhaps a disk drive has a 'format' action that a user can access, even though they cannot access files INSIDE the disk drive.

Another example of an object is a user account. Some people need to CRUD user accounts. You can also reset passwords and add accounts to permission groups

Because of this, it is important to define all of the objects and their functions so we can control and secure a system.

One way to do this is to use a subject-object-activity matrix. This document outlines who has access to what objects and the activity they are allowed to invoke.

##### Activities and Actions

When we list all objects in a system, we must understand the actions and activities that a SUBJECT could do to each object.

- Activities and actions are allowable events that a subject can do to an object
- Specific activities are defined by the OBJECT, i.e.
  - File: access, modify, delete
  - DB record: create, read, update, delete
  - Disk drive: mount, unmount, format
- All activities and actions should be defined and documented
  - This is to ensure that these activities/actions are PROTECTED PROPERLY.
  - *any undocumented or overlooked functionality could be used to compromise a system*

#### Sequencing and Timing Requirements

Sequencing and timing can definitely affect applications, especially now.

- Disparate systems can attempt SIMULTANEOUS interaction with an object
  - Esp. servlets or web requests
- Also, different systems can try to access the same OBJECT simultaneously.

A number of problems could arise from this simultaneous access.

Events can also occur out of order due to thread timing differences if two programs are running.

When a triggering event happens, if TWO threads react to it, they may do the same thing with DIFFERENT timings.

If there is a dependency between two threads, i.e. Thread A needs Thread B to do Action X, say, to prepare data, before Thread A can do Action Y, to use the data, then these threads MUST work together and have a mechanism to do this.

This is important so that actions do not happen prematurely.

Issues that can arise:
- Race conditions and infinite loops
  - This impacts data activity design and implementation

##### Race conditions

- Software flaw
- Difficult to predict and find
- Can cause complex logic loops (no, using `Thread.sleep(2000)` will not mitigate this!!! STOP USING DELAYS! AAAAAAARRRGHHH!!!)
- Mitigated via Mutex locks
  - TBH, any locking mechanism will mitigate race conditions

These occur when 2 processes need to access the same object.  

Mutex is essentially a way to allow one thread to lock an object for ITS EXCLUSIVE USE and DENY any other thread access to the object.

If mutex is not properly handled, it is a software bug and may return an error or crash. Or do other horrible things. If this is the case, errors only happen during a small time window and therefore are very hard to actually encounter reliably.

If the two processes are separated by a lot of time, the error PROBABLY will not happen, so it APPEARS that the system works. But it will fail from time to time.

This failure frequency can depend on:

- Length of a time a process accesses an object exclusively,
- How frequently an object is accessed
  - By extension, the load on a system

Databases are full of locking mechanisms. ACID! Thread 1 marks a DB as 'in use', and Thread 2  waits. 

##### Infinite loops

- Occur with complex logic when loop controls fail
- Application can become unresponsive
- Mitigated via proper loop controls

To avoid this, the LOOP CONTROL must be implemented properly.

For complex conditionals, like `((if A ) or ((if B) and (if C) xx ...))`, developers must take into consideration ALL POSSIBLE STATES, not just common or expected ones.

### Operational Requirements

#### Deployment Requirements

Software is usually connected to other programs, and rarely runs on its own.

When outlining deployment environments that are necessary to install and configure a software, we need to outline all activities and tasks that need to be done by different people during the deployment.

Deployment requirements outline activities and tasks to be done by the software:
- Acquirer
  - Purchases the software
- Supplier
  - Supplies the software
- Developer
  - May customize software during deployment
- Or any combination of roles

All of these deployment requirements must be outlines in a plan that not only details who does what, but also when each task needs to be completed.

- Plan is executed by fulfilling the requirements based on SOP outlined by the organization

The best way to test the Dep Reqs is to repeat these activities in the TEST environment, and is also a good way to reset the test env to the beginning by redeploying over and over.

- The deployment plan should indicate a method (problem reporting) to capture real-time performance data for:
  - Process mgmt
  - Process improvement

One important part of a deployment is being able to identify when things DO NOT go as planned.

When something goes wrong, how do we know about it?

Every deployment plan must have a way to identify if a problem is occurring.

Ideally data is captured realtime, and issues are identified as they are occurring, so that potential compromise windows are as small as possible.

#### Operations Requirements

Once software is deployed, we need to understand and docuemnt the operatioal requirements in order to run it day to day.

- Make sure the product is effective in its intended environment
- We must know if the software is running effectively or not
- We need to involve many different people in our organizations
  - End users
  - Admins
  - Etc

- Overall goal is to define and incorporate an established set of activities and tasks to:
  - Ensure proper system operation
  - Ensure proper software product operation
  - Ensure proper software service operation


There should be a schedule for all of these operations tasks and when they should be executed.

- Established set of activies and tasks are performed daily across the organization to:
  - Monitor the operation of software/systems
    - SLA
  - Identify and escalate all abnormal incidents
  - Document and track all user problems
  - Escalate unresolved problems via a resolution process
    - All problems should be escalated UNTIL they are resolved
  - Initiate accepted stakeholder problem resolution
    - Once accepted, they must be implemented
  - Verify and validate accepted product change
    - We must ensure that the change WORKS/fixes the problem.

#### Management Requirements

Mgmt Reqs =/= Ops Reqs. 

Ops Reqs is focused on DAY TO DAY, while Mgmt Reqs are focused on ensuring the software+env are properly maintained.

##### Managing incidents

- Managing Incidents
  - an Incident is any event that interrupts the TYPICAL FUNCTION of a system/software.
    - i.e. my banking site is down, or I can't view my balance, etc.
    - OR, "my work laptop doesn't turn on!"
- Involves:
  - Monitoring incidents
  - Analyze incidents that do occur
  - Appropriate response is made

The docuemtnation and process are the most imortant parts.

If we had an incident and the admin fixes it w/o documenting it, did it happen at all? How can we prove it? (if a tree falls...) How do we know what was done to fix it? How do we know if it was the right way to fix it? How can it be fixed when that admin gets hit by a trolley or retires or quits?

Having a formal process and documenting it is really improtant.

- Problem mgmt
  - It must first be determined if a problem exists
    - Can the issue be replicated?
    - Is there a known, approved fix?

##### Change mgmt

- Change Mgmt
  - Primary goal is to mitigate organizational risk due to changes to systems and software
- Change process can be initiated through ANYTHING that implements change:
  - Patching to fix bugs and vulns
    - Hotfixes and service packs


- Very important to determine if a patch or service pack (or any change) is even required
  - Also pay close attention to vendors so we are aware of patches/SPs.

- Initiate patch regression testing if possible
  - i.e. test it in a TEST ENV and NOT on production first (if possible)

(Regression testing is testing on non-prod systems and slowly rolling out changes to more prod-like envs as you go.)

It is important that the TEST env REPLICATES the DEV environment EXACTLY.

Also, the testing must occur AFTER the patch/SP is applied.

## Secure Software Design

### Design Processes

If we do our job well making software blueprints, then we'll have a beautiful piece of software at the end.

When we make software with security in mind, the goal is to include features that make our software more secure into the initial design. The end result is a well-designed AND SECURE application.

During the design phase:
- Evaluate software requirements
  - From a security standpoint
  - From a functionality standpoint

- Objective is not to make a product, but a SECURE PRODUCT.

#### Attack Surface Evaluation

Attack Surface is "Any area of your code accessed by unauthorized parties".

This includes any areas that ask for creds by users who will later be authorized (i.e. me logging in to my work computer).

So, if you have webpages that any user can request, and that page asks for credentials to allow only authorized users, those webpages are part of the attack surface as users can still interact with it despite not being authorized yet.

The attack surface is a way of measuring items that MAY be exposed to an attack.

- Measuring attackable components
  - More components = greater risk

Example: Webpage. If it has more text boxes for people to fill in, the risk is higher, because the likelihood of any one of those inputs being vulnerable is higher because there are more inputs.

Complexity generally makes attack surfaces larger.

- Disable functions when not in use!

Reducing attack surface -> Reducing exposed elements -> Reducing risk

##### Attack Surface Measurement

Attack surface of an application depends on understanding the different types of threats and vulns within the app.


To make one:
- Add up all the ways that unauthorized people can access the app
  - The hard part is understanding the different ways...

Remember: If an unauth'd user tries to access the app, and gets prompted to auth, that's part of the attack surface.

Elements associated to an attack surface:
  - Services
  - Guest accounts
  - Weak ACLs

Also, more on building attack surface lists:
- Historical vulns
- Don't just focus on GUIs.
- 'Could this happen to us?'
- All software is different, vulns can vary between products.

##### Attack Surface Minimization

Once we understand the vulns, we can start reducing the attack surface.

- Goal is to reduce attack surface
  - You must reduce exposed items
    - Disable services
    - Lower privileges
  - Anything implemented to reduce the attack surface needs to be well-documented
  - Attack surface needs to be calculated during THE DEVELOPMENT PROCESS as any new code or features can introduce new vulns
  - We may allow an admin to dynamically enable/disable features that increase/decrease attack surface
    - This means they must be well-informed about security implications depending on the features they select
      - i.e. this PRINTINATOR feature opens port 42069 and has some horrifying TELNET printing system that is amazingly insecure, why does this exist oh my god, no sane person will ever use this.
  - Attack surface should be minimized DURING THE DESIGN PHASE so that our software is designed with a SMALL attack surface, and **SECURITY IS NOT AN AFTERTHOUGHT**.
    - This reduces the overall cost as less code is changed in later phases

#### Threat Modeling and Documentation

Threat modeling is about identifying and documenting threats.

The process can be hard as it involves trying to identify many unknowns that may pose a security risk.

We may not be aware a vuln exists, and miss adding it to a list of threats.

All of this info about threats modeled must be communicated to development. This lets them design defenses to mitigate threats.

This documentation must be continuously maintained throughout the product, so it is essentially a living document. We could find a new threat at ANY TIME and need to make sure it's properly documented.

Threat modeling should be started early in the design process. This makes it easy to mitigate any threats with DESIGN CHANGES, not code changes, i.e. waiting until the development phase.

Threat Modeling is everyone's responsibility, and involves many different roles.

Ex: One threat gives us fraudulent data, which makes this example occur at the business-case level.

Ex 2: Another threat occurs at low-level access to software components, which is at the technical level.

Everyone on the team has to be wary of potential threats and assist in the modeling efforts.

##### Threat Model Development

Phases of threat modeling:

1.  Identify security objectives
  - Collect all of the requirements and objectives for our software
    - Legal
    - Security
    - Privacy
    - Data storage
    - *This list can come from many sources and needs to be listed and properly detailed
2.  System Decomposition
  - By breaking our system down, we can understand points of access and how data we must protect is moved through the system
3.  Threat Identification
  - Be thorough and ensure that all possible threats are realized
  - Missing a threat likely introduces a security hole
4.  Mitigation Analysis
  - This step has us review each of our threats and address the risk each poses to our software.
5.  Threat Model Validation
  - We review our list of threats and planned mitigation strategy to ensure...
    - The threat is a valid threat
    - It is mitigated appropriately

##### Documentation

Maintaining good documentation is at the core of doing a good job at threat modeling.

- Provides a roadmap on security related information
- Centralized place for information
- Give info to the development team
  - All team members will be on the same page with respect to the plan


- Objectives
  - Enumerate all threats
  - Record all info about each vulnerability and its risk
  - Record planned mitigation strategy for each vulnerability
  - List any dependencies that different components have on eachother

#### Control Identification and Prioritization

- Security is managed and implemented using Security Controls
  - Primary way of impl'ing security
  - Backbone of mitigating threats
  - Can be thought of as a **Mitigation Package** as controls often resolve more than one security threat

Security controls are safeguards/countermeasures that are used to counteract/minimize security risk. ex:

- Enterprise Auth Mechanism
  - Active Directory
- Security protocols
  - IPsec


- Things to think about with Enterprise Controls
  - ACLs
    - Consider using a model that the enterprise has already implemented rather than making a new model
  - Efficiency and Operability
    - These controls will be used by many users and must work with other systems
  - Must consider the env you work in when deciding what controls to implement

##### Priority

When deciding on what controls to implement, we need to ensure that any decision we make meets our requirements. Ususally there are many solutions that work.

- Look at existing security controls
  - If these meet our requirements, they have priority over adding new security controls.
    - This reduces duplicate work
- Security controls should align controls that are common across the software
  - Access Control Lists
  - User Auth
  - Security Mechanisms
  - *This should be done because it reduces duplicating security controls
    - This reduces the security workload by 'aligning'

##### Design Process

A good approach for designing a secure system is to use the SD3 approach:

- Secure by/in...
  - Design
  - Default
  - Deployment

There is more to consider than just the software. We need to consider all of the aspects of our software that need to be secured so we can leverage the right controls to implement.

- Security provision protocols (low-effort implementation)
  - IPsec
  - HTTPS
  - SSH

Reducing the duplication of security controls is always a good thing. It reduces workload AND reduces risk. If we have 2 different controls that serve the same purpose, and if 1 is compromised, we're at risk. Having 2 systems doubles the risk.

#### Design and Architecture Technical Review

The DaATR is something we must do AFTER the attack surface and threat modeling documentation is finished.

We will use the documentation to review the existing design and architecture to ensure that any changes (like adding sec controls) have been properly integrated into the design.

This improves the current development and ensures we get the best design and architecture to meet functional requirements, and that we meet all security goals.

- Periodic reviews done during development process
  - Security progress review
    - How is the project meeting sec goals
  - Code walkthroughs/Design reviews
    - Revisit these reviews during Code/Design reviews
  - Attack surface examination
  - Documentation on threat modeling

- Review is both technical and process-focused.
  - It's easy to get sidetracked and change the process when making technical changes
  - Stay as true to the planned process as possible
- Security review
  - Done by dev team during dev process
  - Security cannot be added after
    - Much better to build proper security controls into the software to begin with

The review process ensures we pay the proper amount of attention to security.

It also ensures we are progressing enough in the activities that a DaATR covers, like implementing security controls, so we know those activities are being completed at appropriate levels. "Is everything we're concerned about being completed as expected?"

#### Risk Assessment for Code Reuse

When we reuse code, we need to see if it meets our security criteria.

Start by assessing risk by:
- Examine potential security issues
  - Part of this process is reviewing legacy code for vulnerabilities
    - "Legacy code" means any code we are intending to reuse as it must comply with our security requirement

Legacy code will probably have crap documentation, so you'll probably have to do a full risk assessment on it.

If it has good documentation, then you'll probably just have to review it.

- Include the use of legacy code in threat modelling and attack surface minimization efforts
- If legacy code has already gone through this process and was deemed as "SAFE", then it is A MISTAKE to continue to treat it as "SAFE".
  - This is a mistake because there can be a lot of issues/differences when the legacy code is implemented again in a new environment, that can introduce new vulnerabilities.
  - There might also be new vulns discovered that were just never found
- The old code will likely be running in a new environment instead of what it was intended for. This can introduce new vulns or cause problems.

##### Code Reuse

Even though we have to assess legacy code, reusing code still has benefits and is a very common practice.

- Saves time
- Consistency with other apps
- Reduces work
- Software libraries are a great example of code reuse
  - A software lib is a group of legacy code that has a common relationship

### Design Considerations

#### Applicable Methods to Address Core Security Concepts

When developing software, security must not be an afterthought.

We need to consider the following during the development of the software like the methods to address core security concepts.

Secure comms between different components is important.

##### Confidentiality

- Prevents disclosure to unauthorized parties
- Secure secret information
- Identify elements during design phase
- Use encryption

##### Integrity

- Protects data from unauthorized changes
- Can use access control mechanisms
- Can use hashing to verify integrity
  - Also can use digital signatures
- The challenge is deciding how to implement integrity as there are many ways to do it

##### Availability

- About ensuring the system is available
- Common threat is DoS attack
- Other threats exist though, not just DoS attacks.
  - Hardware failures
- Must review threat model -- Not all threats are made by hackers. 
  - Hardware/software failure, etc.
  - System failure
  - Errors
- Backups
- Data replication
- Failover
  - Clustering

##### Authentication

- Can verify someone's identity
- Can be authenticating a person, process, system, or hardware device
- Compromising authentication is extremely valuable to hackers
  - Either getting creds or bypassing the mechanism
- 2FA is very good.
  - 2 ways of verifying the user is the right person
  - i.e. uname+pw and send a nonce to email/cell.
    - They have creds
    - They have access to email/cell

##### Authorization

- We allow an authenticated user to access functionality of a system that they are allowed to access
- Can be  complex to implement
  - Large number of users
  - Large number of securable assets
- Many systems have built-in authorization mechanisms to control access control lists
  - Active Directory
  - As long as these work, use them. Reduces code and uses common mechanisms.
- If built-in mechanisms DON'T meet our requirements, we must make CUSTOM authorization mechanisms to provide the security

##### Accounting

- Often overlooked.
- About measuring activity in the system
  - Usually by logging
- Must decide WHAT to log, we can't log everything.
  - This is done during Design Phase.
- Must protect (encrypt) data in logs.
- Must ensure data in logs cannot be tampered with.

#### Security Design Principles

#### Interconnectivity

#### Interfaces

### Securing Commonly Used Architecture

#### Distributed Computing

#### Service-oriented Architecture

#### Rich Internet Applications

#### Pervasive and Ubiquitous Computing

#### Integrating with Existing Architectures

#### Cloud Architectures

#### Mobile Applications

### Technologies

#### Authentication and Identity Management

#### Credentail Management

#### Flow Control

#### Logging

#### Data Loss Prevention

#### Virtualization

#### Digital Rights Management

#### Trusted Computing

#### Database Security

#### Programming Language Environment

#### Operating Systems

#### Embedded Systems

## Secure Software Implementation and Coding

## Secure Software Testing

## Software Acceptance, Deployment, Operations, Maintenance, and Disposal

## Supply Chain and Software Acquisition

