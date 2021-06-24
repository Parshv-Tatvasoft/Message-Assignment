import express from "express";
import { addMessage, getMessages } from "../controllers/message.controller";
import { messageValidation } from "../validation/message.validation";

const router = express.Router();

router.post("/addmessage", messageValidation.addMessage, addMessage);
router.get("/getmessages", messageValidation.getMessage, getMessages);

export default router;
