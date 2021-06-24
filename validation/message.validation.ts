import { checkSchema } from "express-validator";
import { ErrorMessages } from "../enums/message.enum";

export const messageValidation = {
  addMessage: checkSchema({
    username: {
      notEmpty: { errorMessage: ErrorMessages.NoUserName },
    },
    message: {
      notEmpty: { errorMessage: ErrorMessages.NoMessage },
    },
  }),
  getMessage: checkSchema({
    offset: {
      notEmpty: { errorMessage: ErrorMessages.NoOffset },
    },
    limit: {
      notEmpty: { errorMessage: ErrorMessages.NoLimit },
    },
  }),
};
