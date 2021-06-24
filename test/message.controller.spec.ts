import { expect } from "chai";
import { Chance } from "chance";
import { Response, Request } from "express";
// import { mock, reset, when, instance, deepEqual } from 'ts-mockito';
import * as httpMocks from "node-mocks-http";
import { describe, beforeEach, it } from "mocha";
import { Messages } from "../models/message.request";
import loki from "lokijs";
import proxyquire from "proxyquire";

const chance: Chance.Chance = new Chance();
const lokiDBMock = new loki(chance.string());
const MessagesMock = lokiDBMock.addCollection<Messages>("messages", {
  autoupdate: true,
});
const message = {
  username: chance.string(),
  message: chance.string(),
  message_id: chance.string(),
  timestamp: new Date().toUTCString(),
} as Messages;
MessagesMock.insertOne(message);
const responseMock = httpMocks.createResponse();
const requestMock = httpMocks.createRequest();

const testController = proxyquire("../controllers/message.controller", {
  "../utils/database": {
    messages: MessagesMock,
    lokiDB: lokiDBMock,
  },
});

describe("Controller", () => {
  let addMessage: (req: Request, res: Response) => Promise<Response>;
  let getMessages: (req: Request, res: Response) => Promise<Response>;
  let MessagesResponse: Messages & LokiObj;
  let MessagesInsertResponse: Resultset<Messages & LokiObj>;
  let MessagesRequest: Messages;

  beforeEach(() => {
    addMessage = testController.addMessage;
    getMessages = testController.getMessages;
    requestMock.body = {};
    requestMock.query = {};
    requestMock.params = {};
    MessagesRequest = {
      username: chance.string(),
      message: chance.string(),
      message_id: chance.string(),
      timestamp: new Date().toUTCString(),
    } as Messages;
    MessagesResponse = {
      ...MessagesRequest,
      $loki: chance.integer(),
      meta: {
        created: chance.integer(),
        revision: chance.integer(),
        updated: chance.integer(),
        version: chance.integer(),
      },
    } as Messages & LokiObj;
    MessagesInsertResponse = {
      ...MessagesRequest,
      $loki: chance.integer(),
      meta: {
        created: chance.integer(),
        revision: chance.integer(),
        updated: chance.integer(),
        version: chance.integer(),
      },
    } as object as Resultset<Messages & LokiObj>;
  });
  it("add message should return HTTP 200 OK", async () => {
    MessagesMock.insertOne = (): Messages & LokiObj => {
      return MessagesResponse;
    };
    requestMock.body = { timestamp: new Date().toUTCString() };
    await addMessage(requestMock, responseMock);
    expect(responseMock.statusCode).to.equal(201);
  });
  it("get message should return HTTP 200 OK", async () => {
    lokiDBMock.getCollection = <
      F extends object = any
    >(): loki.Collection<F> => {
      return MessagesMock as any;
    };
    requestMock.body = {
      min_timestamp: new Date().toUTCString(),
      max_timestamp: new Date().toUTCString(),
      username: message.username,
      has_text: message.message,
      offset: chance.integer(),
      limit: chance.integer(),
    };
    await getMessages(requestMock, responseMock);
    expect(responseMock.statusCode).to.equal(200);
  });
  it("get message should return HTTP 200 OK without max", async () => {
    lokiDBMock.getCollection = <
      F extends object = any
    >(): loki.Collection<F> => {
      return MessagesMock as any;
    };
    requestMock.body = {
      min_timestamp: new Date().toUTCString(),
      username: message.username,
      has_text: message.message,
      offset: chance.integer(),
      limit: chance.integer(),
    };
    await getMessages(requestMock, responseMock);
    expect(responseMock.statusCode).to.equal(200);
  });
  it("get message should return HTTP 200 OK without min", async () => {
    lokiDBMock.getCollection = <
      F extends object = any
    >(): loki.Collection<F> => {
      return MessagesMock as any;
    };
    requestMock.body = {
      username: message.username,
      max_timestamp: new Date().toUTCString(),
      has_text: message.message,
      offset: chance.integer(),
      limit: chance.integer(),
    };
    await getMessages(requestMock, responseMock);
    expect(responseMock.statusCode).to.equal(200);
  });
});
