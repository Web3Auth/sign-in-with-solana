/* eslint-disable mocha/max-top-level-suites */
/* eslint-disable mocha/no-setup-in-describe */
import nacl from "@toruslabs/tweetnacl-js";
import assert from "assert";
import base58 from "bs58";

import { ErrorTypes, Signature, SIWS } from "../src/index";
import parsingPositive from "./parsing_positive.json";
import validationNegative from "./validation_negative.json";
import validationPositive from "./validation_positive.json";

describe(`Message Generation from payload`, function () {
  Object.entries(parsingPositive).forEach(([test, value]) => {
    it(`Generates message successfully: ${test}`, function () {
      const { payload } = value.fields;
      const msg = new SIWS({ payload });
      assert.equal(msg.toMessage(), value.message);
    });
  });
});

describe(`Message Generation from message`, function () {
  Object.entries(parsingPositive).forEach(([test, value]) => {
    it(`Generates message successfully: ${test}`, function () {
      const msg = new SIWS(value.message);
      assert.equal(msg.toMessage(), value.message);
    });
  });
});

describe(`Message Validation`, function () {
  Object.entries(validationPositive).forEach(([test, value]) => {
    it(`Validates message successfully: ${test}`, async function () {
      const { payload } = value;
      const { signature } = value;
      const msg = new SIWS({ payload });
      const resp = await msg.verify({ payload, signature });
      assert(resp.success);
    });
  });

  Object.entries(validationNegative).forEach(([test, value]) => {
    it(`Fails to verify message: ${test}`, async function () {
      const { payload, signature } = value;
      const msg = new SIWS({ payload });
      try {
        const error = await msg.verify({ payload, signature });
        assert(Object.values(ErrorTypes).includes(error.error.type));
      } catch (error) {
        // this is for time error
        assert(Object.values(ErrorTypes).includes(error.message));
      }
    });
  });
});

describe(`Round Trip`, function () {
  const rbytes = nacl.randomBytes(32);
  const keypair = nacl.sign.keyPair.fromSeed(rbytes);
  Object.entries(parsingPositive).forEach(([test, value]) => {
    it(`Generates a Successfully Verifying message: ${test}`, async function () {
      const { payload } = value.fields;
      payload.address = base58.encode(keypair.publicKey);
      const msg = new SIWS({ payload });
      const encodedMessage = new TextEncoder().encode(msg.prepareMessage());
      const signatureEncoded = base58.encode(nacl.sign.detached(encodedMessage, keypair.secretKey));
      const signature = new Signature();
      signature.s = signatureEncoded;
      signature.t = "sip99";
      const { success } = await msg.verify({ signature, payload });
      assert.equal(success, true);
    });
  });
});
