# Android release signing

The private app-signing key is intentionally **not stored in this public repository**.

## Stable app identity

- Application ID: `com.openai.pechemerveilles`
- Canonical release certificate SHA-256 fingerprint:
  `EF:1C:77:18:48:56:7E:58:4B:06:9F:B4:9C:7A:50:49:16:BC:9A:27:A0:F4:8B:91:AF:E9:D6:A3:40:C6:34:B2`
- This fingerprint was re-verified against the distributed signed 2.0.1 APK on 2026-08-27.

Every distributed update must be signed with the same private key. Replacing the key would make Android treat the APK as an incompatible update unless an explicit supported key-rotation path is used.

## Build flow

1. GitHub Actions runs tests and builds `app-release-unsigned.apk`.
2. CI verifies the APK archive and alignment and publishes the unsigned release candidate together with the official Build Tools `apksigner.jar`.
3. Outside the public repository, sign the candidate with the protected release keystore.
4. Verify the signed APK with `apksigner verify --verbose --print-certs` and confirm the SHA-256 signer fingerprint above before distribution.
5. Never commit the keystore, private key, passwords, or signing command containing passwords.

The unsigned CI artifact is not a distributable release. Only the APK signed with the canonical release certificate should be installed by users.
