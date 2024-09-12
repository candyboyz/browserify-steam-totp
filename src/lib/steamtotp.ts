import { Buffer } from 'buffer';

import axios from 'axios';
import CryptoJS from 'crypto-js';

export class SteamAuthenticator {
  private readonly _DIGITS = 5;
  private readonly _PERIOD = 30;
  private readonly _ALPHABET = '23456789BCDFGHJKMNPQRTVWXY';

  /**
   * Get the current time in seconds, optionally with a time offset
   * @param timeOffset Time offset in seconds (optional)
   * @returns The current time in seconds `number`
   */
  getTime(timeOffset?: number) {
    return Math.floor(Date.now() / 1000) + (timeOffset || 0);
  }

  /**
   * Generate a one-time authentication code (TOTP)
   * @param secret The secret key as a string
   * @param timeOffset Time offset in seconds (optional)
   * @returns The generated one-time authentication code `string`
   */
  generateAuthCode(secret: string, timeOffset = 0) {
    const keyData = this.bufferizeSecret(secret);

    const time = Math.floor(this.getTime(timeOffset) / this._PERIOD);

    const buffer = Buffer.allocUnsafe(8);
    buffer.writeUInt32BE(0, 0);
    buffer.writeUint32BE(time, 4);

    const hmac = CryptoJS.HmacSHA1(
      CryptoJS.lib.WordArray.create(buffer),
      keyData
    );
    const hmacResult = CryptoJS.enc.Hex.parse(hmac.toString());

    const hmacBytes = [];
    for (let i = 0; i < hmacResult.words.length * 4; i++) {
      hmacBytes.push((hmacResult.words[i >> 2] >> (24 - (i % 4) * 8)) & 0xff);
    }

    const start = hmacBytes[hmacBytes.length - 1] & 0x0f;

    let material =
      ((hmacBytes[start] & 0x7f) << 24) |
      ((hmacBytes[start + 1] & 0xff) << 16) |
      ((hmacBytes[start + 2] & 0xff) << 8) |
      (hmacBytes[start + 3] & 0xff);

    let code = '';
    for (let i = 0; i < this._DIGITS; i++) {
      code += this._ALPHABET[material % this._ALPHABET.length];
      material = Math.floor(material / this._ALPHABET.length);
    }

    return code;
  }

  /**
   * Generate a confirmation key for Steam
   * @param identitySecret The secret key for Steam authentication
   * @param time Unix time in seconds
   * @param tag The tag for the key (e.g., 'conf')
   * @returns The confirmation key `string`
   */
  generateConfirmationKey(identitySecret: string, time: number, tag: string) {
    let dataLen = 8;

    if (tag) {
      dataLen += tag.length > 32 ? 32 : tag.length;
    }

    const buffer = Buffer.allocUnsafe(dataLen);

    if (typeof buffer.writeBigUInt64BE === 'function') {
      buffer.writeBigUInt64BE(BigInt(time), 0);
    } else {
      buffer.writeUInt32BE(0, 0);
      buffer.writeUInt32BE(time, 4);
    }

    if (tag) {
      buffer.write(tag, 8);
    }

    const hmac = CryptoJS.HmacSHA1(
      CryptoJS.lib.WordArray.create(buffer),
      CryptoJS.lib.WordArray.create(Buffer.from(identitySecret, 'base64'))
    );

    return CryptoJS.enc.Base64.stringify(hmac);
  }

  /**
   * Generate the device ID based on the SteamID
   * @param steamid The user's SteamID
   * @returns The device ID `string`
   */
  getDeviceId(steamid: string) {
    const hash = CryptoJS.SHA1(steamid.toString())
      .toString(CryptoJS.enc.Hex)
      .replace(
        /^([0-9a-f]{8})([0-9a-f]{4})([0-9a-f]{4})([0-9a-f]{4})([0-9a-f]{12}).*$/,
        '$1-$2-$3-$4-$5'
      );

    return `android:${hash}`;
  }

  /**
   * Asynchronously get the time offset from Steam servers
   * @returns An object with the time offset and the request time
   */
  async getTimeOffsetAsync() {
    try {
      const start = Date.now();

      const response = await axios.post(
        'https://api.steampowered.com/ITwoFactorService/QueryTime/v1/',
        null,
        {
          headers: {
            'Content-Length': '0',
          },
        }
      );

      const data = response.data.response;

      if (!data || !data.server_time) {
        throw new Error('Malformed response');
      }

      const end = Date.now();
      const offset = data.server_time - this.getTime();

      return {
        offset,
        time: end - start,
      };
    } catch (error) {
      throw new Error(error.message || 'Request failed');
    }
  }

  /**
   * Get the time offset from Steam servers using a callback
   * @param callback The callback function to return the error or result
   */
  getTimeOffset(
    callback: (error?: Error, offset?: number, time?: number) => void
  ) {
    const start = Date.now();

    axios
      .post(
        'https://api.steampowered.com/ITwoFactorService/QueryTime/v1/',
        null,
        {
          headers: {
            'Content-Length': '0',
          },
        }
      )
      .then((response) => {
        const data = response.data.response;

        if (!data || !data.server_time) {
          return callback(new Error('Malformed response'));
        }

        const end = Date.now();
        const offset = data.server_time - this.getTime();

        callback(null, offset, end - start);
      })
      .catch((error) => {
        callback(new Error(error.message || 'Request failed'));
      });
  }

  /**
   * Convert the secret string into a format that can be used by CryptoJS
   * @param secret The secret string (in hex or base64)
   * @returns The parsed secret as a CryptoJS `WordArray`
   */
  private bufferizeSecret(secret: string) {
    if (typeof secret === 'string') {
      if (secret.match(/[0-9a-f]{40}/i)) {
        return CryptoJS.enc.Hex.parse(secret);
      } else {
        return CryptoJS.enc.Base64.parse(secret);
      }
    }
    return secret;
  }
}

export const SteamTotp = new SteamAuthenticator();
