import { Response, Request } from "express";
import {
  MessageRequest,
  Messages,
  GetMessageRequest,
} from "../models/message.request";
import { messages, lokiDB } from "../utils/database";
import { HTTPStatusCode } from "../enums/status_code.enum";
import { ResponseMessages, ErrorMessages } from "../enums/message.enum";

import { v4 as uuidv4 } from "uuid";
import moment from "moment";
import { Result, ValidationError, validationResult } from "express-validator";

export const addMessage = async (req: Request, res: Response) => {
  try {
    const errorsList: Result<ValidationError> = validationResult(req);
    const errors: string[] = errorsList.array().map((each) => each.msg);

    if (errors && errors.length) {
      return res
        .status(HTTPStatusCode.BadRequest)
        .send({ statusCode: HTTPStatusCode.BadRequest, error: errors });
    }

    const message: MessageRequest = req.body;
    const message_id: string = uuidv4();
    const timestamp: string = moment().toISOString();
    const messageObj: Messages = { ...message, message_id, timestamp };

    const data = messages.insertOne(messageObj);

    const resultData = { ...data };
    delete resultData?.$loki;
    delete resultData?.meta;

    return res.json({
      statusCode: HTTPStatusCode.Created,
      message: ResponseMessages.AddSuccess,
      data: resultData,
    });
  } catch (error) {
    return res.status(HTTPStatusCode.InternalServerError).send({
      statusCode: HTTPStatusCode.InternalServerError,
      error: ResponseMessages.AddError,
    });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const errorsList: Result<ValidationError> = validationResult(req);
    const errors: string[] = errorsList.array().map((each) => each.msg);

    if (errors && errors.length) {
      return res
        .status(HTTPStatusCode.BadRequest)
        .send({ statusCode: HTTPStatusCode.BadRequest, error: errors });
    }

    const requestBody: GetMessageRequest = req.body;

    const perPage = requestBody.limit || 10,
      page = requestBody.offset == 1 ? 0 : requestBody.offset - 1;

    const messageCollection = lokiDB.getCollection<Messages>("messages");
    let result = messageCollection.chain().find({});

    if (requestBody.username) {
      result = result.where((data: Messages) => {
        return data.username == requestBody.username?.trim();
      });
    }

    if (requestBody.has_text) {
      result = result.where((data: Messages) => {
        return data.message.includes(
          requestBody?.has_text ? requestBody?.has_text.trim() : ""
        );
      });
    }

    if (requestBody.min_timestamp || requestBody.max_timestamp) {
      result = result.where((data: Messages) => {
        if (requestBody.min_timestamp && requestBody.max_timestamp) {
          return (
            moment(data.timestamp).isSameOrAfter(requestBody?.min_timestamp) &&
            moment(data.timestamp).isSameOrBefore(requestBody?.max_timestamp)
          );
        } else {
          if (requestBody.min_timestamp) {
            return moment(data.timestamp).isSameOrAfter(
              requestBody?.min_timestamp
            );
          } else {
            return moment(data.timestamp).isSameOrBefore(
              requestBody?.max_timestamp
            );
          }
        }
      });
    }

    const resultData = result
      .simplesort("message_id", true)
      .offset(perPage * page)
      .limit(perPage)
      .data({ removeMeta: true });

    return res.status(HTTPStatusCode.Success).json({
      statusCode: HTTPStatusCode.Success,
      message: ResponseMessages.GetSuccess,
      result: resultData,
    });
  } catch (error) {
    return res
      .status(HTTPStatusCode.InternalServerError)
      .send({ error: ResponseMessages.GetError });
  }
};
