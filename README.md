> [!IMPORTANT]
> **This repository is archived and no longer maintained.**
>
> It holds the source of <https://dnslink.dev>, which stays up. Work on the
> standard stopped in 2022: the reference libraries
> [dnslink-std/js](https://github.com/dnslink-std/js) and
> [dnslink-std/go](https://github.com/dnslink-std/go) have had no release since
> then, and `docs/README.md` describes DNSLink as it stood then. Parts of it
> have broken since, starting with the tutorial's own example, where
> `_dnslink.libp2p.io` no longer returns a TXT record.
>
> DNSLink itself is not going away. To publish and resolve records, read
> [DNSLink in the IPFS docs](https://docs.ipfs.tech/concepts/dnslink/).
> `docs/README.md` remains the only place the record format is written down.
>
> The repository can be unarchived, but only for a named maintainer who commits
> to keeping it up. If that is you, reach out to the
> [IPFS Foundation](https://ipfsfoundation.org/about/) on the
> [IPFS forum](https://discuss.ipfs.tech/).

# [dnslink.dev](https://dnslink.dev) website

This is the website at https://dnslink.dev (and https://dnslink.io)

## Develop

```
npm ci
npm start
```

## License

[MIT](./LICENSE)
