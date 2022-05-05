/* eslint-disable mocha/max-top-level-suites */
/* eslint-disable mocha/no-setup-in-describe */
import assert from "assert";
import base58 from "bs58";
import nacl from "tweetnacl";

import { Signature, SIWS } from "../src/index";
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
      await assert.doesNotReject(msg.verify({ payload, signature }));
    });
  });

  test.concurrent.each(Object.entries(validationNegative))("Fails to verify message: %s", async (_n, testFields) => {
    try {
      const { payload } = testFields;
      const { signature } = testFields;
      const msg = new SIWS({ payload });
      await msg.verify({ payload, signature });
    } catch (error) {
      expect(Object.values(SIWS).includes(error));
    }
  });
});

describe(`Round Trip`, function () {
  const rbytes = nacl.randomBytes(32);
  const keypair = nacl.sign.keyPair.fromSeed(rbytes);
  test.concurrent.each(Object.entries(parsingPositive))("Generates a Successfully Verifying message: %s", async (_, el) => {
    const { payload } = el.fields;
    payload.address = base58.encode(keypair.publicKey);
    const msg = new SIWS({ payload });
    const encodedMessage = new TextEncoder().encode(msg.prepareMessage());
    const signatureEncoded = base58.encode(nacl.sign.detached(encodedMessage, keypair.secretKey));
    const signature = new Signature();
    signature.s = signatureEncoded;
    signature.t = "sip99";
    await expect(msg.verify({ signature, payload }).then(({ success }) => success)).resolves.toBeTruthy();
  });
});
