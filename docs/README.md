---
head:
  - - link
    - rel: canonical
      href: https://dnslink.dev/
---

## Introduction

DNSLink is the specification of a format for [DNS][] [`TXT` records][TXT] that allows the
association of arbitrary content paths and identifiers with a [domain][].

DNSLink leverages the powerful distributed architecture of DNS for a variety of systems that require internet scale mutable names or pointers.

![](./img/dns-query.png)

## Try it out

<try-dnslink />

## How does it work?

A DNSLink record is a specifically formatted `TXT` record that allows you to
_link_ resources to that domain. It follows [RFC 1464][rfc1464], which defines
a structured format of TXT records as `<key>=<value>`:

```
dnslink=<value>
```

When you register a domain at your [name registrar][name-registrar] you can set `TXT` records
additionally to `A`, `MX` or `CNAME` records.


Using just a DNS client, anyone can quickly resolve DNSLink, discover available
records, and request the resource through linked protocols.

Here is an example for a valid DNSLink record pointing at content root on IPFS:

```
dnslink=/ipfs/bafybeiaysi4s6lnjev27ln5icwm6tueaw2vdykrtjkwiphwekaywqhcjze
```


### Looking up DNSLink records

You _can_ use any DNS resolution tool, such as `dig`, to lookup `TXT` records for a domain. <br>

```sh
> dig +short TXT _dnslink.en.wikipedia-on-ipfs.org
"dnslink=/ipfs/bafybeiaysi4s6lnjev27ln5icwm6tueaw2vdykrtjkwiphwekaywqhcjze"
```

::: tip Tips

- MS Windows user? `dig.exe` is part of [the ISC's `bind` package][windows-dig]
- Generic DNS tool like `dig` will show **all** `TXT` records for a domain. To make things easier, you can use the
  `dnslink` command-line client provided with either the [JavaScript][js] or [Golang][go] package.
  Either will list only the valid DNSLink `TXT` records.

  ```sh
  > dnslink en.wikipedia-on-ipfs.org
  /ipfs/QmaCveU7uyVKUSczmiCc85N7jtdZuBoKMrmcHbnnP26DCx
  ```

:::

## Specification

### Record Format

DNSLink records are of the form:

```ini
dnslink=/<namespace>/<identifier>
```


- The prefix `dnslink=` signals that the `TXT` record in question is a DNSLink. This is
  important as `TXT` records are used for many purposes that DNSLink should not interfere with.
- Starting with `/<namespace>/` ensures multiple links can coexist.
  - This prefix allows clients to ignore records linking to unsupported protocols or addressing systems.
  - Implementations should never error on invalid record. Simply ignore and move to the next one.
- The remainder after the second `/` is an `identifier` specific to the `namespace`.

#### DNSLink Record Example

In the example below, the `namespace` is `ipfs` and `identifier` is the IPFS [CID][] `bafy...cjze`.

```ini
dnslink=/ipfs/bafybeiaysi4s6lnjev27ln5icwm6tueaw2vdykrtjkwiphwekaywqhcjze
```

### `_dnslink` subdomain

DNSLink records MUST be specified on the `_dnslink` subdomain instead of
defining them directly on the domain:

```sh
> dig +short TXT _dnslink.example.com
dnslink=/ipfs/bafy...abcd
```

This allows for secure DNSLink management and [`CNAME` delegation](#cname-delegation).

DNSLink implementations automatically lookup the `_dnslink` subdomain behind the scenes:

```sh
> dnslink example.com
/ipfs/bafy...abcd
```

### Multiple records

#### Multiple `dnslink=` `TXT` records per domain

DNSLink is a general-purpose protocol. It is not tied to any specific namespace.
It can point at content-addressed data on [`/ipfs/`][IPFS], [`/hyper/`][hyper], etc.


Therefore you are free to specify more than one `dnslink=/<namespace>/<identifier>` TXT record
per domain:

```sh
> dig +short TXT _dnslink.example.com
"dnslink=/ipfs/.."
"dnslink=/hyper/.."
"dnslink=/foo/.."
```

#### Multiple values per namespace

Publishing more than one record for the same namespace is allowed by DNS clients and DNSLink libs
and this specification, but system responsible for processing those records is free to reject
such state as invalid, if it makes no sense for a specific namespace.

#### Sorting

DNS specification states that TXT records do not need to arrive at the client in order.
It is suggested to sort DNSLink records in lexicographical order before they get evaluated.
This ensures deterministic results when more than one record is present,


### Redirects and delegation

#### CNAME  delegation

Use of `CNAME` is the suggested way for delegating DNSLink resolution from one DNS name to another.


Example below delegates DNSLink record resolution for `example.com` to TXT records
at `_dnslink.external-service.example.net`

```sh
> dig +noall +answer TXT _dnslink.example.com
_dnslink.dnslink.dev.	1612	IN	CNAME	_dnslink.external-service.example.net
_dnslink.external-service.example.net. 112 IN TXT "dnslink=/ipfs/bafkqae2xmvwgg33nmuqhi3zajfiemuzahiwss"
```

Standard DNS chaining rules apply, as noted in [RFC 1034][rfc1034]:

> Of course, by the robustness principle, domain software should not fail when
> presented with CNAME chains or loops; CNAME chains should be followed and
> CNAME loops signalled as an error.


<!-- TODO: hide ALIAS section below for now - needs more explanation in context of regular A and gateways.

#### ALIAS  delegation

DWeb protocols often use CNAME  technique along with an `ALIAS` record to also delegate resolution of `A` and `AAAA` records used for HTTP gateway to some third-party CDN hosting for legacy HTTP clients:

```console
$ dig +noall +answer TXT example.com
example.com.		118	IN	TXT	"ALIAS for http-gateway.example.net"
```

-->

### `TTL` of the `TXT` record

The default `TTL` for DNS records is usually `3600`, which is 1 hour. We recommend setting a low `TTL`
in the `TXT` record, something like `60` seconds or so. This makes it so you can update your name
quickly, and use it for website deploys.

## Tutorial

Prefer learning by doing? Follow the below tutorial.

It covers DNSLink creation and resolution using popular command-line tools.


### Step 0: Find something to link to

In this tutorial, we'll link to [the libp2p website][libp2p], on [IPFS][].
At the time of writing this, the website had the IPFS address:

```
/ipfs/Qmc2o4ZNtbinEmRF9UGouBYTuiHbtCSShMFRbBY5ZiZDmU
```

You can view this on one of [public gateways][public-gateways]:
[dweb.link/ipfs/Qmc2...ZDmU](https://dweb.link/ipfs/Qmc2o4ZNtbinEmRF9UGouBYTuiHbtCSShMFRbBY5ZiZDmU)

And even download it with [Kubo `ipfs` CLI][kubo]:

```
ipfs get /ipfs/Qmc2o4ZNtbinEmRF9UGouBYTuiHbtCSShMFRbBY5ZiZDmU
```

### Step 1: Choose a domain name to link from

For this tutorial, I'll use the domain name `libp2p.io`. You can use whatever domain you control.
I happen to be using an `ALIAS` record on this domain as well (to make the website load directly
via the IPFS gateway), but that is not a problem: the convention to prefix the TXT record domain with
`_dnslink.` allows for complex DNS setups like this.

So the full domain name I'll set the record on is: `_dnslink.libp2p.io`.

### Step 2: Set the DNSLink value on a `TXT` record

Let's set the link by creating a `TXT` record on the domain name. This is going to be specific to
your DNS tooling. Unfortunately there is no standard cli tool or web service to set domain names 🙁.

Every registrar and name server has its own web app, and API tooling.
Refer to their respective documentations and tutorials.

The gist is to create a new `TXT` record on `_dnslink.libp2p.io` with the value:

```
dnslink=/ipfs/Qmc2o4ZNtbinEmRF9UGouBYTuiHbtCSShMFRbBY5ZiZDmU
```

To illustrate, setting the record via an imaginary DNS CLI tool could look like this:

```sh
> my-dns-tool set \
    --type=TXT \
    --ttl=60 \
    --domain=libp2p.io \
    --name=_dnslink \
    --value="dnslink=/ipfs/Qmc2o4ZNtbinEmRF9UGouBYTuiHbtCSShMFRbBY5ZiZDmU"

_dnslink.libp2p.io TXT 60 dnslink=/ipfs/Qmc2o4ZNtbinEmRF9UGouBYTuiHbtCSShMFRbBY5ZiZDmU
```

Setting it via web interface could look similar to this one:

![](./img/digitalocean.png)


### Step 3: Resolve the DNSLink

Now, let's try resolving the link, and reading the data behind it using namespace/protocol-specific tool.

You can get the link value manually using `dig` or another DNS lookup tool:

```sh
> dig +short TXT _dnslink.libp2p.io
dnslink=/ipfs/Qmc2o4ZNtbinEmRF9UGouBYTuiHbtCSShMFRbBY5ZiZDmU
```

Extract the value with `sed`:
```sh
> dig +short TXT _dnslink.libp2p.io | sed -E 's/"dnslink=(.*)"/\1/g'
/ipfs/Qmc2o4ZNtbinEmRF9UGouBYTuiHbtCSShMFRbBY5ZiZDmU
```

Then, you can feed the output of that to software that understands IPFS paths.

Here, we use [`ipfs` CLI from Kubo][kubo] to list the contents of a directory
identified by [CID][] `Qmc2o4ZNtbinEmRF9UGouBYTuiHbtCSShMFRbBY5ZiZDmU`:

```sh
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


::: tip

[Kubo][] IPFS CLI has DNSLink resolution built in though, so you could just do the following to achieve the same result as in the tutorial above:

```sh
> ipfs resolve /ipns/libp2p.io
/ipfs/Qmc2o4ZNtbinEmRF9UGouBYTuiHbtCSShMFRbBY5ZiZDmU
```

:::

## Usage Examples

Below are some examples of DNSLink being used in real world.


### Robust Website Hosting

It is a good idea to publish DNSLink records with identifiers of website content addressed with non-HTTP protocols (e.g., [IPFS][]).
This improves resiliency, and enables user agents to opportunistically upgrade to more modern and decentralized transports and routing protocols.

- [IPFS Gateways](#ipfs-gateway) support resolving DNSLinks automatically. See [public  gateway list][].
  - Install [Kubo][] daemon and follow [gateway recipes][]
  - Or use third-party service such as [Cloudflare][cloudflare-dnslink] or [Fleek][fleek-dnslink]
- The [IPFS Companion browser extension](#ipfs-companion) works with Chromium and Firefox. It can resolve DNSLinks automatically and load the content with help of a local IPFS gateway. It will also recover from HTTP server being down, and load content over IPFS, even when redirect is disabled by default. See more in the [IPFS Companion documentation][ipfs-companion-dnslink].
- [Brave browser supports resolving IPFS DNSLinks][brave-ipfs] in form of `ipns://en.wikipedia-on-ipfs.org`, it will also detect when website has DNSLink and suggest opening it via supported protocols such as [IPFS][].

#### Website Examples

Many websites use DNSLink and IPFS. Some examples:

- https://ipfs.tech
- https://libp2p.io
- https://ipld.io
- https://multiformats.io
- https://ipfs.kiwix.org (https://github.com/ipfs/distributed-wikipedia-mirror)
  - https://en.wikipedia-on-ipfs.org
  - https://tr.wikipedia-on-ipfs.org
  - https://my.wikipedia-on-ipfs.org
  - https://ar.wikipedia-on-ipfs.org
  - https://zh.wikipedia-on-ipfs.org
  - https://uk.wikipedia-on-ipfs.org
  - https://ru.wikipedia-on-ipfs.org
  - https://fa.wikipedia-on-ipfs.org




### In IPFS Ecosystem

Many IPFS implementations (e.g., [Kubo][]) come with built-in supports resolving DNSLink names on `/ipns/` namespace:

```sh
> ipfs resolve /ipns/libp2p.io
/ipfs/Qmc2o4ZNtbinEmRF9UGouBYTuiHbtCSShMFRbBY5ZiZDmU
```

You can find out more at the [IPFS DNSLink documentation][ipfs-dnslink].


#### IPFS Gateway

[IPFS gateways][IPFS Gateway] resolve DNSLink automatically for:
- Requests for `/ipns/example.com` content paths. Check it out at https://ipfs.io/ipns/libp2p.io or https://dweb.link/ipns/libp2p.io (the latter will [provide proper origin isolation][subdomain-gateway] for use in browsers).
- Requests with `Host: example.com` HTTP header that includes domain with a valid DNSLink. For example, https://en.wikipedia-on-ipfs.org is backed by an IPFS gateway.

::: details How does that work?

The gateway takes the part after `/ipns/`, if it is a DNS domain name, it
checks for a DNSLink at either the domain name, or `_dnslink.` prefixed version. In this case it
finds our DNSLink at `_dnslink.libp2p.io` and resolves that.

##### But what about `https://libp2p.io`?

Yes, `libp2p` also works, that uses a combination of DNSLink, a `ALIAS` record in `libp2p.io`,
and the IPFS gateway reading domain from the `Host` header sent with HTTP request.

Basically:

1. The browser first checks for `A` records for `libp2p.io`. DNS finds an `ALIAS` to
    `gateway-int.ipfs.io`, and those `A` records:

    ```
    > dig A libp2p.io
    gateway.ipfs.io.        119     IN      A       209.94.90.1
    ```

2. The browser then connects to HTTP server at `209.94.90.1`, using a `Host: libp2p.io` HTTP header.
3. The IPFS gateway reads the `HOST: libp2p.io` header, and -- recognizing a DNS name -- checks for
    an associated DNSLink at either `libp2p.io` or `_dnslink.libp2p.io`.

    ```
    > dig +short TXT _dnslink.libp2p.io
    "dnslink=/ipfs/Qmc2o4ZNtbinEmRF9UGouBYTuiHbtCSShMFRbBY5ZiZDmU"
    ```

4. The gateway finds the link at `_dnslink.libp2p.io` leading to
    `/ipfs/Qmc2o4ZNtbinEmRF9UGouBYTuiHbtCSShMFRbBY5ZiZDmU`.
5. The gateway fetches the IPFS web content at
    `/ipfs/Qmc2o4ZNtbinEmRF9UGouBYTuiHbtCSShMFRbBY5ZiZDmU` and serves it to the browser.
6. The browser renders it happily, preserving the original pretty name of `https://libp2p.io`

:::

#### IPFS Companion

Similar to the IPFS Gateway, [IPFS Companion][] browser extension uses
DNSLink natively within the browser to resolve IPFS web content. IPFS Companion has a feature that
tests domain names for the presence of dnslink `TXT` records, and if it finds them, then it serves
content via a local IPFS gateway instead.

You can find out more about how it works at
[IPFS Companion's DNSLink documentation][ipfs-companion-doc].

## Libraries

DNSLink protocol is simple enough to use standard DNS libraries,
however, more advanced tooling for testing and debugging exists.

There are currently reference implementations for two programming languages available:

- Golang: [dnslink-std/go][go]
- JavaScript: [@dnslink/js][js]

Both are tested using the universal [DNSLink test harness][dnslink-test].

## External Resources

- [IPFS and DNSLink][ipfs-dnslink]
- [IPFS Companion and DNSLink][ipfs-companion-dnslink]
- [DNSLink support in Brave browser][brave-ipfs]
- [DNSLink support at Cloudflare][cloudflare-dnslink]
- [DNSLink support at Fleek][fleek-dnslink]
- [Youtube: Explanation of how DNSLink and the IPFS Gateway works][yt-explainer]

## FAQ

#### Is there an IETF RFC spec?

Not yet. We should write one.

#### Can I use DNSLink in non-DNS systems?

Yes absolutely. For example, you can use DNSLink to resolve names from alternative systems such as Ethereum Name System (ENS).
An example of such "DNS Gateway" can be found at https://github.com/wealdtech/coredns-ens/.

::: tip Hey!

If you use DNSLink for something cool like this, be sure to add it to the [Usage Examples](#usage-examples) section of this doc.

:::

#### Why use `_dnslink.domain` instead of `domain`?

`_dnslink.domain` does not conflict with `CNAME` and `ALIAS` records, and is better for operations
security: enables you to set up an automated publishing or delegate control over your DNSLink
records to a third party without giving away full control over the original DNS zone.

`TXT` record on `domain` is deprecated and resolved by some software only for legacy reasons: we
historically started with supporting records on the normal domain, and only found the issue with
`CNAME` and `ALIAS` records later on. Those problems are absent when `_dnslink.domain` is used.

Rule of thumb: always use `_dnslink.domain`.

#### Why use the `dnslink=` prefix in the `TXT` value?

The prefix `dnslink=` is there to signal that this `TXT` record value is a DNSLink. This is
important because many systems use TXT records, and there is a convention of storing multiple space
separated values in a single `TXT` record. Following this format allows your DNSLink resolver to
parse through whatever is in the `TXT` record and use the first record prefixed with `dnslink=`.

#### Why not use other DNS record types, like `SRV`?

Special purpose records enforce some structure to their values, and these are not flexible enough.
We wanted a simple protocol that allowed us to link to any other system or service, in perpetuity.
This can only be achieved with systems designed to allow structure within the input. The `TXT`
record is a good example of this -- it imposes a string value, but it allows the user to make sense
out of anything within that string. Sets of users can impose different rules for resolution.

In our case, this is handled through [Multiaddr][].

#### Why not just extend DNS with more record types?

It seems that what DNSLink does could be accomplished by a verity of new special purpose record
types. But extending DNS is a very expensive process -- in terms of time and adoption. We wanted to
find a way to use all the existing infrastructure without requiring any changes at all.


#### Why DNS?

> The [Domain Name System](https://en.wikipedia.org/wiki/Domain_Name_System) (DNS) is a hierarchical
> and decentralized naming system for computers, services, or other resources connected to the
> Internet or a private network. ... By providing a worldwide, distributed directory service, the
> Domain Name System has been an essential component of the functionality of the Internet since
> 1985.

DNS is:
- **somewhat decentralized** - it delegates naming authority to nations and organizations world-wide
- **hierarchical** - it achieves scalable naming via name space partitioning
- **scalable** - it is the dominant name system on the planet -- most internet traffic uses it
- **ubiquitous** - as the dominant internet name system since 1985, DNS is well-known and
    well-supported.

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
- **not offline-first** - DNS does not have good solutions for values to spread through
    intermittently connected networks
- **cumbersome** - buying, registering, and setting values on a name is more complicated than
    acquiring a mutable pointer should be.
- **not program friendly** - registering DNS names requires being a human or a human organization
    with human agents, with access to credit cards. this isn't suitable for lots of programs.

These are all good reasons to develop new, better name systems. But until those work better than
DNS, you'll probably use DNS.

## Community

See resources at  [dnslink-std/community](https://github.com/dnslink-std/community).

### Contributors

- [@jbenet](https://github.com/jbenet)
- [@whyrusleeping](https://github.com/whyrusleeping)
- [@lgierth](https://github.com/lgierth)
- [@victorb](https://github.com/victorb)
- [@diasdavid](https://github.com/diasdavid)
- [@martinheidegger](https://github.com/martinheidegger)
- [@lidel](https://github.com/lidel)
- and undoubtedly many more

Developed with the support of [Protocol Labs](https://protocol.ai)

[name-registrar]: https://en.wikipedia.org/wiki/Domain_name_registrar
[rfc1464]: https://datatracker.ietf.org/doc/html/rfc1464
[rfc1034]: https://datatracker.ietf.org/doc/html/rfc1034
[CID]: https://docs.ipfs.tech/concepts/content-addressing/
[windows-dig]: https://www.isc.org/download/
[DNS]: https://en.wikipedia.org/wiki/Domain_Name_System
[TXT]: https://en.wikipedia.org/wiki/TXT_record
[domain]: https://en.wikipedia.org/wiki/Domain_name
[js]: https://npmjs.com/package/@dnslink/js
[go]: https://github.com/dnslink-std/go/releases
[js-cli]: https://github.com/dnslink-std/js#command-line
[go-cli]: https://github.com/dnslink-std/go#command-line
[kubo]: https://github.com/ipfs/kubo
[IPFS]: https://ipfs.tech
[brave-ipfs]: https://github.com/brave/brave-browser/issues/13609
[public-gateways]: https://ipfs.github.io/public-gateway-checker/
[subdomain-gateway]: https://docs.ipfs.tech/how-to/address-ipfs-on-web/#subdomain-gateway
[hyper]: https://hypercore-protocol.org/protocol/#hyperdrive
[Multiaddr]: https://multiformats.io/multiaddr/
[dnslink-test]: https://github.com/dnslink-std/test
[gateway-examples]: https://github.com/ipfs/kubo/blob/master/docs/config.md#gateway-recipes
[this-page]: https://github.com/dnslink-std/dnslink-website/edit/main/docs/README.md
[ipfs-dnslink]: https://docs.ipfs.tech/concepts/dnslink/
[ipfs-companion-doc]: https://github.com/ipfs-shipyard/ipfs-companion/blob/master/docs/dnslink.md
[ipfs-companion-dnslink]: https://docs.ipfs.tech/how-to/dnslink-companion/
[cloudflare-dnslink]: https://developers.cloudflare.com/distributed-web/ipfs-gateway/connecting-website/
[fleek-dnslink]: https://docs.fleek.co/domain-management/dns-link/
[yt-explainer]: https://www.youtube.com/watch?v=YxKZFeDvcBs
[libp2p]: https://libp2p.io
[IPFS Gateway]: https://docs.ipfs.tech/concepts/glossary#gateway
[gateway recipes]: https://github.com/ipfs/kubo/blob/master/docs/config.md#gateway-recipes
[public gateway list]: https://ipfs.github.io/public-gateway-checker/
[IPFS Companion]: https://github.com/ipfs-shipyard/ipfs-companion#readme

