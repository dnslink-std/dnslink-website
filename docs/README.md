---
head:
  - - link
    - rel: canonical
      href: https://dnslink.dev/
---

## Introduction

DNSLink is the specification of a format for [DNS][] [`TXT` records][TXT] that allows the association of arbitrary content paths and identifiers with a [domain][].

![](./img/dns-query.png)

## Try it out

<try-dnslink />

## How does it work?

When you register a domain at your [name registrar][name-registrar] you can set `TXT` entries additionally to `A` or `CNAME`.

DNSLink specifies a format for `TXT` entries that allow you to _link_ resources to that domain.

Using just a DNS client, anyone can quickly lookup the link and request the resource through a decentralized network.

Here is an example for a valid DNSLink `TXT` entry pointing at content root on IPFS:

```
dnslink=/ipfs/QmaCveU7uyVKUSczmiCc85N7jtdZuBoKMrmcHbnnP26DCx
```

### Tools

You _can_ use `dig` to lookup the `dnslink=` TXT entries for at domain. <br>_(for Windows users: `dig.exe` is part of [the ISC's `bind` package](https://www.isc.org/download/))_

```sh
> dig +short TXT _dnslink.dnslink.dev
_dnslink.dnslink-website.on.fleek.co.
"dnslink=/ipfs/QmaCveU7uyVKUSczmiCc85N7jtdZuBoKMrmcHbnnP26DCx"
```

There is also a `dnslink` CLI client provided with either [JavaScript][js] or [GO][go] libraries that can be used for in-depth inspection and validation of DNSLink records.

```sh
> dnslink dnslink.dev
/ipfs/QmaCveU7uyVKUSczmiCc85N7jtdZuBoKMrmcHbnnP26DCx
```


### Format

DNSLink entries are of the form:

```
dnslink=/<namespace>/<identifier>
```

- The prefix `dnslink=` is there to signal that this `TXT` record value is a DNSLink. This is important because `TXT` records are used for many purposes that DNSLink should not interfere with.
- As there are more than one decentralized system, the value after `=` is an opaque "content path" where each segment is separated by `/`
- The the very first segment indicates `namespace` of the decentralized system you want to use for content resolution, and the remainder is an `identifier` specific to that system.  To illustrate, in IPFS namespace is `ipfs` and identifier is a [CID](https://docs.ipfs.io/concepts/content-addressing/): `/ipfs/bafkqae2xmvwgg33nmuqhi3zajfiemuzahiwss`

### `_dnslink` subdomain

DNSLink entries should be specified on the `_dnslink` subdomain!

```shell
> dig +short TXT _dnslink.fictive.domain
dnslink=/ipfs/QmBBBB....BBBB
```

Looking up `fictive.domain` will use the entry of `_dnslink.fictive.domain`!

```shell
> dnslink fictive.domain
/ipfs/QmBBBB....BBBB
```

### Multiple entries

#### Multiple `dnslink=` `TXT` entries per domain

There is more than one kind of dweb resource out there. [`ipfs`][ipfs] and [`hyper`][hyper] as just two popular examples. Everyone is free to specify more than one `dnslink=/<namespace>/<identifier>` TXT entry per domain:

```console
$ dig +short TXT _dnslink.example.com
"dnslink=/ipfs/bafy.."
"dnslink=/hyper/.."
"dnslink=/foo/.."
```

#### Multiple values per namespace

Publishing more than one record for the same namespace is allowed by DNS clients and DNSLink libs and specs, but system responsible for processing those records is free to reject such state as invalid.

#### Sorting

To ensure DNSLink records are processed in deterministic manner, make sure to sort TXT record values in sort them in alphabetical order. This is important because DNS TXT records are not sorted and can arrive in different order.


### Redirects and delegation

#### CNAME  delegation

Use of `CNAME` is the suggested way for delegating DNSLink resolution from one DNS name to another.

Example below delegates DNSLink record resolution for `example.com` to TXT records at `_dnslink.external-service.example.net`

```console
$ dig +noall +answer TXT _dnslink.example.com
_dnslink.dnslink.dev.	1612	IN	CNAME	_dnslink.external-service.example.net
_dnslink.external-service.example.net. 112 IN TXT "dnslink=/ipfs/bafkqae2xmvwgg33nmuqhi3zajfiemuzahiwss"
```

<!-- TODO: hide ALIAS section below for now - needs more explanation in context of regular A and gateways.

#### ALIAS  delegation

DWeb protocols often use CNAME  technique along with an `ALIAS` record to also delegate resolution of `A` and `AAAA` records used for HTTP gateway to some third-party CDN hosting for legacy HTTP clients:

```console
$ dig +noall +answer TXT example.com
example.com.		118	IN	TXT	"ALIAS for http-gateway.example.net"
```

-->

[name-registrar]: https://en.wikipedia.org/wiki/Domain_name_registrar
[DNS]: https://en.wikipedia.org/wiki/Domain_Name_System
[TXT]: https://en.wikipedia.org/wiki/TXT_record
[domain]: https://en.wikipedia.org/wiki/Domain_name
[js]: https://npmjs.com/package/@dnslink/js
[go]: https://github.com/dnslink-std/go/releases
[js-cli]: https://github.com/dnslink-std/js#command-line
[go-cli]: https://github.com/dnslink-std/go#command-line
[ipfs]: https://ipfs.io
[hyper]: https://hypercore-protocol.org/protocol/#hyperdrive
[multiaddr]: https://multiformats.io/multiaddr/

## Tutorial

### Step 0: Find something to link to.

In this tutorial, we'll link to [the libp2p website](https://libp2p.io), on [IPFS](https://ipfs.io). At the time of writing this, the website had the IPFS address:

```
/ipfs/Qmc2o4ZNtbinEmRF9UGouBYTuiHbtCSShMFRbBY5ZiZDmU
```

You can view this on the global IPFS gateway: https://ipfs.io/ipfs/Qmc2o4ZNtbinEmRF9UGouBYTuiHbtCSShMFRbBY5ZiZDmU

And even download it with ipfs:

```
ipfs get /ipfs/Qmc2o4ZNtbinEmRF9UGouBYTuiHbtCSShMFRbBY5ZiZDmU
```

### Step 1: Choose a domain name to link from.

For this tutorial, I'll use the domain name `libp2p.io`. You can use whatever domain you control. I happen to be using an `ALIAS` record on this domain as well (to make the website load directly via the IPFS gateway), but that is not a problem: the convention to prefix the domain with `_dnslink.` allows for complex DNS setups like this.

So the full domain name I'll set the record on is: `_dnslink.libp2p.io`.

### Step 2: Set the DNSLink value on a `TXT` record.

Let's set the link by creating a `TXT` record on the domain name. This is going to be specific to your DNS tooling. Unfortunately there is no standard cli tool or web service to set domain names :(. Every registrar and name server has its own web app, and API tooling. (yes, this is widely regarded as a poor state of affairs).

Consider setting the record, via an imaginary dns cli tool:

```
> my-dns-tool set --type=TXT --ttl=60 --domain=libp2p.io --name=_dnslink --value="dnslink=/ipfs/Qmc2o4ZNtbinEmRF9UGouBYTuiHbtCSShMFRbBY5ZiZDmU"
_dnslink.libp2p.io TXT 60 dnslink=/ipfs/Qmc2o4ZNtbinEmRF9UGouBYTuiHbtCSShMFRbBY5ZiZDmU
```

Or directly in a Digital Ocean prompt:

![](./img/digitalocean.png)


### Step 3: Resolve the link

Now, let's try resolving the link!

You can get the link value manually using `dig` or another dns lookup tool:

```
> dig +short TXT _dnslink.libp2p.io
dnslink=/ipfs/Qmc2o4ZNtbinEmRF9UGouBYTuiHbtCSShMFRbBY5ZiZDmU
```

Extract the value with `sed`:
```
> dig +short TXT _dnslink.libp2p.io | sed -E 's/"dnslink=(.*)"/\1/g'
/ipfs/Qmc2o4ZNtbinEmRF9UGouBYTuiHbtCSShMFRbBY5ZiZDmU
```

Then, you can feed the output of that to ipfs:

```
> ipfs ls /ipfs/Qmc2o4ZNtbinEmRF9UGouBYTuiHbtCSShMFRbBY5ZiZDmU
QmeotoX2bE7fVgMvUS9ZXL2RMoZQHiuQVZZR1Hts3JVmUT 265   _previous-versions
QmP5JpytsFEQ5Y8oQ875kPrdA1dAtyXAH6U8eKbTUbptNd -     bundles/
QmcRUrMyFePBNnvoqZB5Uk7y6aoWGoUW6EB8JWUxztKTma -     categories/
QmeVM9YZStiFcjjQYpzJ1KWJsaFGcRWaeMAymSfLydu9mh -     css/
QmRJjyE1Bi64AD7MSpt4xKHaiWXq7WGAne8KTzn7UyYeWq -     fonts/
Qma6Eg1JMAPjBg827ywDG1nx4TBwxYWxQxeb1CXUkDnrHk -     img/
QmdB9xXJHNXnaiikCXVpomHriNGXwvSUqdkC1krtFq4WWW -     implementations/
QmXCq4KMZC4mdxovpnrHU9K92LVBLSExLEsrvwTGNEswnv 62880 index.html
QmQNjTorGWRTqEwctqmdBfuBBRTj8vQD3iGjNNCu7vA5i9 3138  index.xml
QmPsosZeKZTUcBkcucPtPnk3fF4ia4vBdJ6str9CRr6VTQ -     js/
QmYBUY8Y8uXEAPJSvMTdpfGoL8bujNo4RKoxkCnnKXoTD9 -     media/
QmUZ23DEtL3aUFaLgCEQv5yEDigGP2ajioXPVZZ6S7DYVa 561   sitemap.xml
QmRgig5gnP8XJ16PWJW8qdjvayY7kQHaJTPfYWPSe2BAyN -     tags/
```

Or chain it all together:

```
> dig +short TXT _dnslink.libp2p.io | sed -E 's/"dnslink=(.*)"/\1/g' | ipfs ls
QmeotoX2bE7fVgMvUS9ZXL2RMoZQHiuQVZZR1Hts3JVmUT 265   _previous-versions
QmP5JpytsFEQ5Y8oQ875kPrdA1dAtyXAH6U8eKbTUbptNd -     bundles/
QmcRUrMyFePBNnvoqZB5Uk7y6aoWGoUW6EB8JWUxztKTma -     categories/
QmeVM9YZStiFcjjQYpzJ1KWJsaFGcRWaeMAymSfLydu9mh -     css/
QmRJjyE1Bi64AD7MSpt4xKHaiWXq7WGAne8KTzn7UyYeWq -     fonts/
Qma6Eg1JMAPjBg827ywDG1nx4TBwxYWxQxeb1CXUkDnrHk -     img/
QmdB9xXJHNXnaiikCXVpomHriNGXwvSUqdkC1krtFq4WWW -     implementations/
QmXCq4KMZC4mdxovpnrHU9K92LVBLSExLEsrvwTGNEswnv 62880 index.html
QmQNjTorGWRTqEwctqmdBfuBBRTj8vQD3iGjNNCu7vA5i9 3138  index.xml
QmPsosZeKZTUcBkcucPtPnk3fF4ia4vBdJ6str9CRr6VTQ -     js/
QmYBUY8Y8uXEAPJSvMTdpfGoL8bujNo4RKoxkCnnKXoTD9 -     media/
QmUZ23DEtL3aUFaLgCEQv5yEDigGP2ajioXPVZZ6S7DYVa 561   sitemap.xml
QmRgig5gnP8XJ16PWJW8qdjvayY7kQHaJTPfYWPSe2BAyN -     tags/
```

## Usage Examples

### Example: User-friendly name resolution within IPFS

IPFS has DNSLink resolution built in though, so you could just do the following to achieve the same result as in the tutorial above.

Given this dnslink:
```
> dig +short TXT _dnslink.libp2p.io
dnslink=/ipfs/Qmc2o4ZNtbinEmRF9UGouBYTuiHbtCSShMFRbBY5ZiZDmU
```

ipfs uses DNSLink to resolve it natively:
```
> ipfs ls /ipns/libp2p.io
QmeotoX2bE7fVgMvUS9ZXL2RMoZQHiuQVZZR1Hts3JVmUT 265   _previous-versions
QmP5JpytsFEQ5Y8oQ875kPrdA1dAtyXAH6U8eKbTUbptNd -     bundles/
QmcRUrMyFePBNnvoqZB5Uk7y6aoWGoUW6EB8JWUxztKTma -     categories/
QmeVM9YZStiFcjjQYpzJ1KWJsaFGcRWaeMAymSfLydu9mh -     css/
QmRJjyE1Bi64AD7MSpt4xKHaiWXq7WGAne8KTzn7UyYeWq -     fonts/
Qma6Eg1JMAPjBg827ywDG1nx4TBwxYWxQxeb1CXUkDnrHk -     img/
QmdB9xXJHNXnaiikCXVpomHriNGXwvSUqdkC1krtFq4WWW -     implementations/
QmXCq4KMZC4mdxovpnrHU9K92LVBLSExLEsrvwTGNEswnv 62880 index.html
QmQNjTorGWRTqEwctqmdBfuBBRTj8vQD3iGjNNCu7vA5i9 3138  index.xml
QmPsosZeKZTUcBkcucPtPnk3fF4ia4vBdJ6str9CRr6VTQ -     js/
QmYBUY8Y8uXEAPJSvMTdpfGoL8bujNo4RKoxkCnnKXoTD9 -     media/
QmUZ23DEtL3aUFaLgCEQv5yEDigGP2ajioXPVZZ6S7DYVa 561   sitemap.xml
QmRgig5gnP8XJ16PWJW8qdjvayY7kQHaJTPfYWPSe2BAyN -     tags/
```

You can find out more at the [IPFS DNSLink documentation](https://docs.ipfs.io/concepts/dnslink/).

### Example: IPFS Gateway

You can also just check it out on the web. The IPFS gateway resolves DNSLink automatically too. Check it out at https://ipfs.io/ipns/libp2p.io or https://dweb.link/ipns/libp2p.io which will provide proper origin isolation for use in browsers.

**How does that work?** The gateway takes the part after `/ipns/`, if it is a DNS domain name, it checks for a DNSLink at either the domain name, or `_dnslink.` prefixed version. In this case it finds our DNSLink at `_dnslink.libp2p.io` and resolves that.

**But what about [https://libp2p.io](https://libp2p.io)?** Yes, https://libp2p.io also works, that uses a combination of DNSLink, a `ALIAS` record in `libp2p.io`, and the ipfs gateway. Basically:
1. the browser first checks for `A` records for `libp2p.io`. dns finds an `ALIAS` to `gateway-int.ipfs.io`, and those `A` records:
    ```
    > dig A libp2p.io
    gateway.ipfs.io.        119     IN      A       209.94.90.1
    ```
2. the browser then connects to `http://209.94.90.1`, using a `HOST: libp2p.io` HTTP header.
3. the ipfs gateway reads the `HOST: libp2p.io` header, and -- recognizing a DNS name -- checks for an associated DNSLink at either `libp2p.io` or `_dnslink.libp2p.io`.
    ```
    > dig +short TXT _dnslink.libp2p.io
    "dnslink=/ipfs/Qmc2o4ZNtbinEmRF9UGouBYTuiHbtCSShMFRbBY5ZiZDmU"
    ```
4. The gateway finds the link at `_dnslink.libp2p.io` leading to `/ipfs/Qmc2o4ZNtbinEmRF9UGouBYTuiHbtCSShMFRbBY5ZiZDmU`.
5. The gateway fetches the IPFS web content at `/ipfs/Qmc2o4ZNtbinEmRF9UGouBYTuiHbtCSShMFRbBY5ZiZDmU` and serves it to the browser.
6. The browser renders it happily, preserving the original pretty name of `https://libp2p.io`


### Example: IPFS Companion

Similar to the IPFS Gateway, [IPFS Companion](https://github.com/ipfs-shipyard/ipfs-companion) uses DNSLink natively within the browser to resolve IPFS web content. IPFS Companion has a feature that tests domain names for the presence of dnslink `TXT` records, and if it finds them, then it serves content via IPFS instead.

You can find out more about how it works at [IPFS Companion's DNSLink documentation](https://github.com/ipfs-shipyard/ipfs-companion/blob/master/docs/dnslink.md).

## Tools

There are a number of tools related to DNSLink.

#### go-ipfs

go-ipfs has built-in support for resolving DNSLinks:

```
$ ipfs name resolve -r /ipns/libp2p.io
/ipfs/Qmc2o4ZNtbinEmRF9UGouBYTuiHbtCSShMFRbBY5ZiZDmU
```

One can also run HTTP Gateway capable of hosting DNSLink websites. See [examples](https://github.com/ipfs/go-ipfs/blob/master/docs/config.md#gateway-recipes).

#### go-dnslink

https://github.com/ipfs/go-dnslink - dnslink resolution in go (used by [go-ipfs](https://github.com/ipfs/go-ipfs))

#### js-dnslink

https://www.npmjs.com/package/dnslink - dnslink resolution in javascript

#### dnslink-deploy

https://github.com/ipfs/dnslink-deploy - `dnslink-deploy` a tool for setting DNSLinks on Digital Ocean (and maybe more someday others):

#### ipfs-deploy

https://github.com/ipfs-shipyard/ipfs-deploy - upload static website to IPFS pinning services and optionally update DNS (Cloudflare, DNSSimple)

## Docs

- IPFS and DNSLink: https://docs.ipfs.io/concepts/dnslink/
- IPFS Companion and DNSLink: https://docs.ipfs.io/how-to/dnslink-companion/
- DNSLink in Cloudflare's Gateway: https://developers.cloudflare.com/distributed-web/ipfs-gateway/connecting-website/
- Explanation of how DNSLink and the IPFS Gateway works: https://www.youtube.com/watch?v=YxKZFeDvcBs

## Known Users

### Systems

#### IPFS

IPFS is a heavy user of DNSLink. It is used in the core API, as part of IPNS, the name system IPFS uses. It is also used in a variety of tools around IPFS.

Learn more at the [IPFS and DNSLink documentation](https://docs.ipfs.io/concepts/dnslink/).

#### IPFS Gateway

[IPFS Gateways](https://docs.ipfs.io/concepts/glossary#gateway) resolve DNSLinks automatically. See [gateway recipes](https://github.com/ipfs/go-ipfs/blob/master/docs/config.md#gateway-recipes) and the [public  gateway list](https://ipfs.github.io/public-gateway-checker/).

#### IPFS Companion

[IPFS Companion](https://github.com/ipfs-shipyard/ipfs-companion) can resolve DNSLinks automatically. See more in the [IPFS Companion documentaion](https://docs.ipfs.io/how-to/dnslink-companion/).

#### add yours here

Add yours on github.

### Websites

Many websites use DNSLink and IPFS. Check some of them out:

- https://ipfs.io
- https://ipld.io
- https://libp2p.io
- https://multiformats.io
- https://en.wikipedia-on-ipfs.org
- https://tr.wikipedia-on-ipfs.org
- https://my.wikipedia-on-ipfs.org
- https://ar.wikipedia-on-ipfs.org
- https://zh.wikipedia-on-ipfs.org
- https://uk.wikipedia-on-ipfs.org
- https://ru.wikipedia-on-ipfs.org
- https://fa.wikipedia-on-ipfs.org

## Best Practices

### Set a low `TTL` in the `TXT` record.

The default `TTL` for DNS records is usually `3600`, which is 1hr. We recommend setting a low `TTL` in the `TXT` record, something like `60` seconds or so. This makes it so you can update your name quickly, and use it for website deploys.

## FAQ

#### Is there an IETF RFC spec?

Not yet. We should write one.

#### Can I use DNSLink in non-DNS systems?

Yes absolutely. For example, you can use DNSLink to resolve names from Ethereum Name System (ENS) thanks to DNS-interop provided at https://eth.link. If you use DNSLink for something cool like this, be sure to add it to the [Users](#Users) section of this doc.

#### Why use `_dnslink.domain` instead of `domain`?

`_dnslink.domain` does not conflict with `CNAME` and `ALIAS` records, and is better for operations security: enables you to set up an automated publishing or delegate control over your DNSLink records to a third party without giving away full control over the original DNS zone.

`TXT` record on `domain` is deprecated and resolved by some software only for legacy reasons: we historically started with supporting records on the normal domain, and only found the issue with `CNAME` and `ALIAS` records later on. Those problems are absent when `_dnslink.domain` is used.

Rule of thumb: always use `_dnslink.domain`.

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

## Community

See resources at  [dnslink-std/community](https://github.com/dnslink-std/community).

### Contributors

- [@jbenet](https://github.com/jbenet)
- [@whyrusleeping](https://github.com/whyrusleeping)
- [@lgierth](https://github.com/lgierth)
- [@victorb](https://github.com/victorb)
- [@diasdavid](https://github.com/diasdavid)
- [@martinheidegger](https://github.com/martinheidegger)
- and undoubtedly many more

Developed with the support of [Protocol Labs](https://protocol.ai)
