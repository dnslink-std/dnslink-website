# DNSLink - linking things with dns

DNSLink is a very simple protocol to link content and services directly from DNS.

DNSLink leverages the powerful distributed architecture of DNS for a variety of systems that require internet scale mutable names or pointers.

## How does it work?

With DNSLink, you can store a link using any DNS domain name. First, put the link in a `TXT` record at a specific subdomain. Then, you can resolve the link from any program by looking up the TXT record value. Your programs and systems can parse out the record value, and follow the link wherever it may go. Yes, it is that simple.

### DNSLink Format

DNSLink values are of the form:

```
dnslink=<value>
```

- The `<value>` is the link you want to set, in [multiaddr](https://multiformats.io/multiaddr/) text format. multiaddr is a format for specifying links and network addresses in a self-describing way. The `<value>` is in text form, not binary packed, so that it works well with DNS tooling and services.
- The prefix `dnslink=` is there to signal that this `TXT` record value is a DNSLink. This is important because many systems use TXT records, and there is a convention of storing multiple space separated values in a single `TXT` record. Following this format allows your DNSLink resolver to parse through whatever is in the `TXT` record and use the first entry prefixed with `dnslink=`.

### DNSLink chaining

As `RFC 1034` says:

> Of course, by the robustness principle, domain software should not fail
> when presented with CNAME chains or loops; CNAME chains should be followed
> and CNAME loops signalled as an error.

Tools should support DNSLink chaining and detect loops as errors.

```
> dig +short TXT _dnslink.test3.dnslink.dev
dnslink=/dnslink/test4.dnslink.dev
```

Should go on to resolve

```
> dig +short TXT _dnslink.test4.dnslink.dev
dnslink=/ipfs/QmYHq32XLpnyBdHBxwxNtQwoPJNqAfgTTTZdq1nmD581nm
```

## Tutorial

### Step 0: Find something to link to.

In this tutorial, we'll link to [my website](https://juan.benet.ai), on [IPFS](https://ipfs.io). The website has the IPFS address:

```
/ipfs/QmYHq32XLpnyBdHBxwxNtQwoPJNqAfgTTTZdq1nmD581nm
```

You can view this on the global IPFS gateway: https://ipfs.io/ipfs/QmYHq32XLpnyBdHBxwxNtQwoPJNqAfgTTTZdq1nmD581nm

And even download it with ipfs:

```
ipfs get /ipfs/QmYHq32XLpnyBdHBxwxNtQwoPJNqAfgTTTZdq1nmD581nm
```

### Step 1: Choose a domain name to link from.

For this tutorial, I'll use my domain name `juan.benet.ai`. You can use whatever domain you control. I happen to be using a `CNAME` record on this domain as well (to make the website load directly via the IPFS gateway), so i'll also have to prefix the domain with `_dnslink.`.

So the full domain name I'll set the record on is: `_dnslink.juan.benet.ai`.

### Step 2: Set the DNSLink value on a `TXT` record.

Let's set the link by creating a `TXT` record on the domain name. This is going to be specific to your DNS tooling. Unfortunately there is no standard cli tool or web service to set domain names :(. Every registrar and name server has its own web app, and API tooling. (yes, this is widely regarded as a poor state of affairs).

Consider setting the record, via an imaginary dns cli tool:
```
> my-dns-tool set --type=TXT --ttl=60 --domain=benet.ai --name=_dnslink.juan --value="dnslink=/ipfs/QmYHq32XLpnyBdHBxwxNtQwoPJNqAfgTTTZdq1nmD581nm"
_dnslink.juan.benet.ai TXT 60 dnslink=/ipfs/QmYHq32XLpnyBdHBxwxNtQwoPJNqAfgTTTZdq1nmD581nm
```

Or directly in a Digital Ocean prompt:

![](img/digitalocean.png)


### Step 3: Resolve the link

Now, let's try resolving the link!

You can get the link value manually using `dig` or another dns lookup tool:

```
> dig +short TXT _dnslink.juan.benet.ai
dnslink=/ipfs/QmYHq32XLpnyBdHBxwxNtQwoPJNqAfgTTTZdq1nmD581nm
```

Extract the value with `sed`:
```
> dig +short TXT _dnslink.juan.benet.ai | sed -E 's/"dnslink=(.*)"/\1/g'
/ipfs/QmYHq32XLpnyBdHBxwxNtQwoPJNqAfgTTTZdq1nmD581nm
```

Then, you can feed the output of that to ipfs:

```
> ipfs ls /ipfs/QmYHq32XLpnyBdHBxwxNtQwoPJNqAfgTTTZdq1nmD581nm
QmZWKQvxBxS2Jgwu9zp2GZ24YVmotxjCocxUYYHWvbfrHf -     about/
QmaqLReYSzBFGs9USasbbn8tDUUoeLL2gBxH8zCF1xTqfC -     blog/
QmVNijwU3fvnin2wapzm4FR3thWw4TEtktsmGYjYY6o97e -     categories/
Qmcw8pJvc5jg3XJy3PDXWrqWUiKhtyb7ZhrmBLY2gingMr -     contact/
QmXiDa3352SyZ6Uhwcsm9ixpmHafhTZKGYAdvndQ4iBw84 -     css/
QmRZJinnF3873kLJo1d8duZPm3gw1vkyiEQLmJPDfCMKQs -     fonts/
QmUjC5zZaCe6g51X4cyCpC9anDiChg4nYFJkB3eDbneHGo 5036  index.html
QmSTjkNwkxPvz4P5P4inywSwJjefhpLKozpiR4ogvE826g 20358 index.xml
QmfQh8N2F6efgbDNptzHr9YpXA9agFYS3aGmwnTmjnnjut -     js/
QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn -     less/
QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn -     lib/
Qmf7TZkJyWYvzfHu3h2xCt5mDQdNHCG9Z1XppnRPr1EuGf -     presskit/
QmPq7oAcPbybYyTzMXcUvmqeud8cP18k82rPncfATB7gzv -     projects/
QmbSmmVkh8Ak7BuYFbTsdwNodPF7MrK7y1vcX3sWAko4wU 4715  sitemap.xml
QmSBCwMH7bUgfHY2PPk68mCnAE887MG9wimYa1j8mAu6BJ -     tags/
QmQejpio5Rj1chbTjN6hbT4ceRzYNpX2uYQFMUWxLwQSSA -     talks/
```

Or chain it all together:

```
> dig +short TXT _dnslink.juan.benet.ai | sed -E 's/"dnslink=(.*)"/\1/g' | ipfs ls
QmZWKQvxBxS2Jgwu9zp2GZ24YVmotxjCocxUYYHWvbfrHf -     about/
QmaqLReYSzBFGs9USasbbn8tDUUoeLL2gBxH8zCF1xTqfC -     blog/
QmVNijwU3fvnin2wapzm4FR3thWw4TEtktsmGYjYY6o97e -     categories/
Qmcw8pJvc5jg3XJy3PDXWrqWUiKhtyb7ZhrmBLY2gingMr -     contact/
QmXiDa3352SyZ6Uhwcsm9ixpmHafhTZKGYAdvndQ4iBw84 -     css/
QmRZJinnF3873kLJo1d8duZPm3gw1vkyiEQLmJPDfCMKQs -     fonts/
QmUjC5zZaCe6g51X4cyCpC9anDiChg4nYFJkB3eDbneHGo 5036  index.html
QmSTjkNwkxPvz4P5P4inywSwJjefhpLKozpiR4ogvE826g 20358 index.xml
QmfQh8N2F6efgbDNptzHr9YpXA9agFYS3aGmwnTmjnnjut -     js/
QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn -     less/
QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn -     lib/
Qmf7TZkJyWYvzfHu3h2xCt5mDQdNHCG9Z1XppnRPr1EuGf -     presskit/
QmPq7oAcPbybYyTzMXcUvmqeud8cP18k82rPncfATB7gzv -     projects/
QmbSmmVkh8Ak7BuYFbTsdwNodPF7MrK7y1vcX3sWAko4wU 4715  sitemap.xml
QmSBCwMH7bUgfHY2PPk68mCnAE887MG9wimYa1j8mAu6BJ -     tags/
QmQejpio5Rj1chbTjN6hbT4ceRzYNpX2uYQFMUWxLwQSSA -     talks/
```

## Usage Examples

### Example: User-friendly name resolution within IPFS

IPFS has DNSLink resolution built in though, so you could just do the following to achieve the same result as in the tutorial above.

Given this dnslink:
```
> dig +short TXT _dnslink.juan.benet.ai
dnslink=/ipfs/QmYHq32XLpnyBdHBxwxNtQwoPJNqAfgTTTZdq1nmD581nm
```

ipfs uses DNSLink to resolve it natively:
```
> ipfs ls /ipns/juan.benet.ai
QmZWKQvxBxS2Jgwu9zp2GZ24YVmotxjCocxUYYHWvbfrHf -     about/
QmaqLReYSzBFGs9USasbbn8tDUUoeLL2gBxH8zCF1xTqfC -     blog/
QmVNijwU3fvnin2wapzm4FR3thWw4TEtktsmGYjYY6o97e -     categories/
Qmcw8pJvc5jg3XJy3PDXWrqWUiKhtyb7ZhrmBLY2gingMr -     contact/
QmXiDa3352SyZ6Uhwcsm9ixpmHafhTZKGYAdvndQ4iBw84 -     css/
QmRZJinnF3873kLJo1d8duZPm3gw1vkyiEQLmJPDfCMKQs -     fonts/
QmUjC5zZaCe6g51X4cyCpC9anDiChg4nYFJkB3eDbneHGo 5036  index.html
QmSTjkNwkxPvz4P5P4inywSwJjefhpLKozpiR4ogvE826g 20358 index.xml
QmfQh8N2F6efgbDNptzHr9YpXA9agFYS3aGmwnTmjnnjut -     js/
QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn -     less/
QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn -     lib/
Qmf7TZkJyWYvzfHu3h2xCt5mDQdNHCG9Z1XppnRPr1EuGf -     presskit/
QmPq7oAcPbybYyTzMXcUvmqeud8cP18k82rPncfATB7gzv -     projects/
QmbSmmVkh8Ak7BuYFbTsdwNodPF7MrK7y1vcX3sWAko4wU 4715  sitemap.xml
QmSBCwMH7bUgfHY2PPk68mCnAE887MG9wimYa1j8mAu6BJ -     tags/
QmQejpio5Rj1chbTjN6hbT4ceRzYNpX2uYQFMUWxLwQSSA -     talks/
```

You can find out more at the [IPFS DNSLink documentation](https://docs.ipfs.io/guides/concepts/dnslink/).

### Example: IPFS Gateway

You can also just check it out on the web. The IPFS gateway resolves DNSLink automatically too. Check it out at https://ipfs.io/ipns/juan.benet.ai

**How does that work?** The gateway takes the part after `/ipns/`, if it is a DNS domain name, it checks for a DNSLink at either the domain name, or `_dnslink.` prefixed version. In this case it finds our DNSLink at `_dnslink.juan.benet.ai` and resolves that.

**But what about [http://juan.benet.ai](http://juan.benet.ai)?** Yes, http://juan.benet.ai also works, that uses a combination of DNSLink, a `CNAME` record in `juan.benet.ai`, and the ipfs gateway. Basically:
1. the browser first checks for `A` records for `juan.benet.ai`. dns finds a `CNAME` to `gateway.ipfs.io`, and those `A` records:
    ```
    > dig A juan.benet.ai
    juan.benet.ai.          59      IN      CNAME   gateway.ipfs.io.
    gateway.ipfs.io.        119     IN      A       209.94.90.1
    ```
2. the browser then connects to `http://209.94.90.1`, using a `HOST: juan.benet.ai` HTTP header.
3. the ipfs gateway reads the `HOST: juan.benet.ai` header, and -- recognizing a DNS name -- checks for an associated DNSLink at either `juan.benet.ai` or `_dnslink.juan.benet.ai`.
    ```
    > dig +short TXT _dnslink.juan.benet.ai
    "dnslink=/ipfs/QmYHq32XLpnyBdHBxwxNtQwoPJNqAfgTTTZdq1nmD581nm"
    ```
4. The gateway finds the link at `_dnslink.juan.benet.ai` leading to `/ipfs/QmYHq32XLpnyBdHBxwxNtQwoPJNqAfgTTTZdq1nmD581nm`.
5. The gateway fetches the IPFS web content at `/ipfs/QmYHq32XLpnyBdHBxwxNtQwoPJNqAfgTTTZdq1nmD581nm` and serves it to the browser.
6. The browser renders it happily, preserving the original pretty name of `http://juan.benet.ai`

**Note:** The lack of `https` here is just my own lack of TLS certificate. You can totally use TLS, DNSLink, and the IPFS Gateway to serve secure websites with IPFS to the browser.

### Example: IPFS Companion

Similar to the IPFS Gateway, [IPFS Companion](https://github.com/ipfs-shipyard/ipfs-companion) uses DNSLink natively within the browser to resolve IPFS web content. IPFS Companion has a feature that tests domain names for the presence of dnslink `TXT` records, and if it finds them, then it serves content via IPFS instead.

You can find out more about how it works at [IPFS Companion's DNSLink documentation](https://github.com/ipfs-shipyard/ipfs-companion/blob/master/docs/dnslink.md).

## Tools

There are a number of tools related to DNSLink.

#### go-dnslink

https://github.com/ipfs/go-dnslink - dnslink resolution in go (used by [go-ipfs](https://github.com/ipfs/go-ipfs))

#### js-dnslink

https://www.npmjs.com/package/dnslink - dnslink resolution in javascript

#### dnslink-deploy

https://github.com/ipfs/dnslink-deploy - `dnslink-deploy` a tool for setting DNSLinks on Digital Ocean (and maybe more someday others):

## Docs

- IPFS and DNSLink: https://docs.ipfs.io/guides/concepts/dnslink/
- IPFS Companion and DNSLink: https://github.com/ipfs-shipyard/ipfs-companion/blob/master/docs/dnslink.md
- DNSLink in Cloudflare's Gateway: https://developers.cloudflare.com/distributed-web/ipfs-gateway/connecting-website/
- Explanation of how DNSLink and the IPFS Gateway works: https://www.youtube.com/watch?v=YxKZFeDvcBs

## Known Users

- IPFS
- IPFS Gateway
- IPFS Companion
- _add your system here_

## Best Practices

### Set a low `TTL` in the `TXT` record.

The default `TTL` for DNS records is usually `3600`, which is 1hr. We recommend setting a low `TTL` in the `TXT` record, something like `60` seconds or so. This makes it so you can update your name quickly, and use it for website deploys.

## FAQ

#### Is there an IETF RFC spec?

Not yet. We should write one.

#### Can I use DNSLink in non-DNS systems?

Yes absolutely. You can use these formats wherever you want, and map the functionality to that service. We would say that's a derivative system though, and not DNSLink proper. For example, you can use DNSLink with the Ethereum Name System (ENS), and use the same value format. One can still support looking but both `name.ens` and `_dnslink.name.ens`. But since ENS doesn't use records (like `TXT`), that part would be obviated. If you use DNSLink for something cool like this, be sure to add it to the [Users](#Users) section of this doc.

#### Why not just use `_dnslink.domain` always, instead of both `_dnslink.domain` and `domain`?

Some domain names are very long. Since DNS has a character limit, it could be that the domain name is far too long to support adding the `_dnslink.` prefix. We also historically started with supporting it in the normal domain, and only found the issue with `CNAME` and `ALIAS` records later on.

#### Why use the `dnslink=` prefix in the `TXT` value?

The prefix `dnslink=` is there to signal that this `TXT` record value is a DNSLink. This is important because many systems use TXT records, and there is a convention of storing multiple space separated values in a single `TXT` record. Following this format allows your DNSLink resolver to parse through whatever is in the `TXT` record and use the first entry prefixed with `dnslink=`.

#### Why not use other DNS record types, like `SRV`?

Special purpose records enforce some structure to their values, and these are not flexible enough. We wanted a simple protocol that allowed us to link to any other system or service, in perpetuity. This can only be achieved with systems designed to allow structure within the input. The `TXT` record is a good example of this -- it imposes a string value, but it allows the user to make sense out of anything within that string. Sets of users can imposese different rules for resolution. In our case, this is handled through [Multiaddr](https://multiformats.io/multiaddr).

#### Why not just extend DNS with more record types?

It seems that what DNSLink does could be accomplished by a verity of new special purpose record types. But extending DNS is a very expensive process -- in terms of time and adoption. We wanted to find a way to use all the existing infrastructure without requiring any changes at all.


#### Why DNS?

> The [Domain Name System](https://en.wikipedia.org/wiki/Domain_Name_System) (DNS) is a hierarchical and decentralized naming system for computers, services, or other resources connected to the Internet or a private network. ... By providing a worldwide, distributed directory service, the Domain Name System has been an essential component of the functionality of the Internet since 1985.

DNS is:
- **somewhat decentralized** - it delegates naming authority to nations and organizations world-wide
- **hierarchical** - it achieves scalable naming via name space partitioning
- **scalable** - it is the dominant name system on the planet -- most internet traffic uses it
- **ubiquitous** - as the dominant internet name system since 1985, DNS is well-known and well-supported.

As a name system, DNS has pragmatic solutions for:
- **control of names**
- **scalable naming**
- **scalable reads and writes**
- **partition tolerance**
- **and more**

Of course, DNS has shortcomings:
- **somewhat centralized** - central authorities manage DNS roots (ICANN, etc.)
- **censorable** - DNS is easy to censor, at the registrar and ISP levels
- **temporary** - DNS names are _rented_, not really _owned_, and can be revoked and seized
- **not offline-first** - DNS does not have good solutions for values to spread through intermittently connected networks
- **cumbersome** - buying, registering, and setting values on a name is more complicated than acquiring a mutable pointer should be.
- **not program friendly** - registering DNS names requires being a human or a human organization with human agents, with access to credit cards. this isn't suitable for lots of programs.

These are all good reasons to develop new, better name systems. But until those work better than DNS, you'll probably use DNS.

## Contributors

- [@jbenet](https://github.com/jbenet)
- [@whyrusleeping](https://github.com/whyrusleeping)
- [@lgierth](https://github.com/lgierth)
- [@victorbjelkholm](https://github.com/victorbjelkholm)
- [@diasdavid](https://github.com/diasdavid)
- and undoubtedly many more

Developed with the support of [Protocol Labs](https://protocol.ai)

## Acknowledgements

This website is based heavily on [underscorejs.org](https://underscorejs.org).
