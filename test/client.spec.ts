import { bs58 as base58 } from "@toruslabs/bs58";
import { randomBytes, sign } from "@toruslabs/tweetnacl-js";
import { describe, expect, it } from "vitest";

import { ErrorTypes, Signature, SIWS } from "../src/index";
import parsingPositive from "./parsing_positive.json";
import validationNegative from "./validation_negative.json";
import validationPositive from "./validation_positive.json";

describe(`Message Generation from payload`, () => {
  Object.entries(parsingPositive).forEach(([test, value]) => {
    it(`Generates message successfully: ${test}`, () => {
      const { payload } = value.fields;
      const msg = new SIWS({ payload });
      expect(msg.toMessage()).toBe(value.message);
    });
  });
});

describe(`Message Generation from message`, () => {
  Object.entries(parsingPositive).forEach(([test, value]) => {
    it(`Generates message successfully: ${test}`, () => {
      const msg = new SIWS(value.message);
      expect(msg.toMessage()).toBe(value.message);
    });
  });
});

describe(`Message Validation`, () => {
  Object.entries(validationPositive).forEach(([test, value]) => {
    it(`Validates message successfully: ${test}`, async () => {
      const { payload } = value;
      const { signature } = value;
      const msg = new SIWS({ payload });
      const resp = await msg.verify({ payload, signature });
      expect(resp.success).toBe(true);
    });
  });

  Object.entries(validationNegative).forEach(([test, value]) => {
    it(`Fails to verify message: ${test}`, async () => {
      const { payload, signature } = value;
      const msg = new SIWS({ payload });
      try {
        const error = await msg.verify({ payload, signature });
        expect(Object.values(ErrorTypes)).toContain(error.error.type);
      } catch (error) {
        // this is for time error
        expect(Object.values(ErrorTypes) as string[]).toContain((error as Error).message);
      }
    });
  });
});

describe(`Round Trip`, () => {
  const rbytes = randomBytes(32);
  const keypair = sign.keyPair.fromSeed(rbytes);

  Object.entries(parsingPositive).forEach(([test, value]) => {
    it(`Generates a Successfully Verifying message: ${test}`, async () => {
      const { payload } = value.fields;
      payload.address = base58.encode(keypair.publicKey);
      const msg = new SIWS({ payload });
      const encodedMessage = new TextEncoder().encode(msg.prepareMessage());
      const signatureEncoded = base58.encode(sign.detached(encodedMessage, keypair.secretKey));
      const signature = new Signature();
      signature.s = signatureEncoded;
      signature.t = "sip99";
      const { success } = await msg.verify({ signature, payload });
      expect(success).toBe(true);
    });
  });
});
