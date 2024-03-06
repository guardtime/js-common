# Changelog
All notable changes to will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

## [2.0.0] - 2024-03-01
### Changed
- Removed node-forge dependency
- Add new hashing library
- Add PKCS#7 verification.

## [1.0.3] - 2020-11-02
### Added
- Added base32 encoder

## [1.0.2] - 2020-07-03
### Fixed
- Uint8Array.from changed to new constructor for safari in DataHash

## [1.0.1] - 2020-04-28
### Fixed
- Node HMAC calculation

## [1.0.0] - 2020-04-08
### Added
- New functionality
  - Calculate random bytes with crypto
  - HMAC functions
  - X509 processing functions
  - Octet string coder and decoder
  - Long coder and decoder
  - Base32 coder and decoder
  - Base64 coder and decoder
  - CRC32 coder and decoder
  - ASCII coder and decoder
  - String utility functions
  - Random functions 
  - Sync and async hasher and connected data objects
  - Verification result data model
  - UTF8 encoder and decoder
  - HashAlgorithm getByName is case insensitive and allows to get
    SHA-256 with the name of DEFAULT.

[Unreleased]: https://github.com/guardtime/js-common/tree/master
[1.0.0]: https://github.com/guardtime/js-common/tree/v1.0.0
[1.0.1]: https://github.com/guardtime/js-common/tree/v1.0.1
[1.0.2]: https://github.com/guardtime/js-common/tree/v1.0.2
[1.0.3]: https://github.com/guardtime/js-common/tree/v1.0.3
[2.0.0]: https://github.com/guardtime/js-common/tree/v2.0.0
