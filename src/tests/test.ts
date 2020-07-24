"use strict";
import app from "./../server";
import supertest from "supertest";

const test = require("unit.js");

const request = supertest(app);

describe("Tests ping", function () {
  it("verifies get", function (done) {
    request
      .get("/api/v1/ping")
      .expect(200, { success: true })
      .end(function (err, result) {
        //test.string(result.body.Output).contains("Aloha como andamios! 2");
        test
          .value(result)
          .hasHeader("content-type", "application/json; charset=utf-8");
        done(err);
      });
  });
  it("verifies post", function (done) {
    request
      .post("/api/v1/ping")
      .expect(200)
      .end(function (err, result) {
        // test.string(result.body.Output).contains("Hello");
        test
          .value(result)
          .hasHeader("content-type", "application/json; charset=utf-8");
        done(err);
      });
  });
});
