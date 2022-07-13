### Installing Postgres on Win10

#### Adding to Path

Navigate to your installation directory. This is typically

```bash
C:\Program Files\PostgreSQL\14\bin
```

Copy and paste that into your Win10 variables for PATH

#### Story time

Before everyone thought MD5 was the best thing since sliced bread. Later on, smart people realized that was wrong. 
Let's look under the hood. DB client and server need to talk to each other to convince they both know the password without exchanging the password or the password hash. 

And it does this using the Salted Challenge and Response, called SCRAM-SHA-256. See RFC-7677, link in reference below.
This makes it very hard to break a password. It also is relevant for passwords encryption at rest requirement, encryption in transit requirement, as well as authentication.

SCRAM is relevant in Postgres 14. It is more relevant due to more resistance needed against

- Replay attacks
- Stolen hashes
- Dictionary attacks

