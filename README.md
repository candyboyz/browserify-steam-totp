# Browserify Steam TOTP

[![npm version](https://img.shields.io/npm/v/browserify-steam-totp.svg?logo=npm)](https://www.npmjs.com/package/browserify-steam-totp)
[![npm downloads](https://img.shields.io/npm/dm/browserify-steam-totp?logo=npm)](https://www.npmjs.com/package/browserify-steam-totp)
[![license](https://img.shields.io/npm/l/browserify-steam-totp.svg?logo=github)](https://github.com/candyboyz/browserify-steam-totp/blob/main/LICENSE)

This is a library for creating a 2fa Steam code, as well as for creating a confirmation code. The library can be used both in Node.js and in the Browser.

# Installation

```bash
npm install browserify-steam-totp
```

# Usage

```ts
import { SteamTotp } from 'browserify-steam-totp';

const code = SteamTotp.generateAuthCode('uB08PipZey9znlgjywrQbId3doc=');

console.log('Steam Guard Code: ', code);
```

#### Arguments

- `secret` - The secret key as a string.
- `timeOffset?` - Time offset in seconds (optional).

#### Return value

If the code has been generated, the method will return it.

- `code` - The auth code.

# SteamTotp

```ts
const { SteamTotp } = requier('browserify-steam-totp');
import { SteamTotp } from 'browserify-steam-totp';
```

This class can be used to generate steam auth code or generate steam confirm key.

## Propeties

**ALPHABET**

Constant with symbols for generating steam auth code.

**DIGITS**

Steam auth code length constant.

**PERIOD**

Constant with steam auth code update time.

## Methods

**bufferizeSecret(secret: string): WordArray**

Convert the secret string into a format that can be used by CryptoJS.

_Parameters:_

- secret: string - The secret string (in hex or base64).

_Returns:_ WordArray

The parsed secret as a CryptoJS WordArray.

**generateAuthCode(secret: string, timeOffset?: number): string**

Generate a one-time authentication code (TOTP).

_Parameters:_

- secret: string - The secret key as a string.
- `Default Value` timeOffset: number = 0 - Time offset in seconds (optional).

_Returns:_ string

The generated one-time authentication code string.

**generateConfirmationKey(identitySecret: string, time: number, tag: string): string**

Generate a confirmation key for Steam.

_Parameters:_

- identitySecret: string - The secret key for Steam authentication.
- time: number - Unix time in seconds.
- tag: string - The tag for the key (e.g., 'conf').

_Returns:_ string

The confirmation key string.

**getDeviceId(steamid: string): string**

Generate the device ID based on the SteamID.

_Parameters:_

- steamid: string - The user's SteamID.

_Returns:_ string

The device ID string.

**getTime(timeOffset?: number): number**

Get the current time in seconds, optionally with a time offset.

_Parameters:_

- `Optional` timeOffset: number - Time offset in seconds (optional).

_Returns:_ number

The current time in seconds number.

**getTimeOffset(callback: (error?: Error, offset?: number, time?: number) => void): void**

Get the time offset from Steam servers using a callback.

_Parameters:_

- callback: (error?: Error, offset?: number, time?: number) => void - The callback function to return the error or result.

  _Parameters:_

  - `Optional` error: Error
  - `Optional` offset: number
  - `Optional` time: number

  _Returns:_ void

_Returns:_ void

**getTimeOffsetAsync(): Promise<{ offset: number; time: number }>**

Asynchronously get the time offset from Steam servers.

_Returns:_ Promise<{ offset: number; time: number }>

An object with the time offset and the request time.

# Documentation

Consult the [Documentation](https://candyboyz.github.io/browserify-steam-totp/)

# Contributing

> Please check the [contributing guidelines]()

# License

Copyright (c) 2019 Eugene

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
