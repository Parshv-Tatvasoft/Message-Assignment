import express from "express";
import messageRoute from "./message.route";

const router = express.Router();

const defaultRoutes = [
  {
    path: "/message",
    route: messageRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
