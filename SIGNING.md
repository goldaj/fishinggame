# Android release signing

The private app-signing key is intentionally **not stored in this public repository**.

## Stable app identity

- Application ID: `com.openai.pechemerveilles`
- Canonical release certificate SHA-256 fingerprint:
  `C4:67:56:DD:0E:B0:93:76:D9:74:34:DB:3C:C5:FF:D0:34:ED:F1:DA:CA:50:6D:1F:C9:D2:6A:C5:32:9D:FA:C5`
- Certificate validity: 2026-08-24 through 2054-01-09.

Every distributed update must be signed with the same private key. Replacing the key would make Android treat the APK as an incompatible update unless an explicit supported key-rotation path is used.

## Build flow

1. GitHub Actions runs tests and builds `app-release-unsigned.apk`.
2. CI verifies the APK archive and alignment and publishes the unsigned release candidate together with the official Build Tools `apksigner.jar`.
3. Outside the public repository, sign the candidate with the protected release keystore.
4. Verify the signed APK with `apksigner verify --verbose --print-certs` and confirm the SHA-256 signer fingerprint above before distribution.
5. Never commit the keystore, private key, passwords, or signing command containing passwords.

The unsigned CI artifact is not a distributable release. Only the APK signed with the canonical release certificate should be installed by users.
