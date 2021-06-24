import loki from "lokijs";
import { Messages } from "../models/message.request";

const lokiDB = new loki("message_db.json", {
  autosave: true,
  autosaveInterval: 100,
  autoload: true,
  persistenceMethod: "localStorage",
});

const messages = lokiDB.addCollection<Messages>("messages", {
  autoupdate: true,
});

export { lokiDB, messages };
