import { Router } from "express";
import userRouter from "./user.routes.js";
import authRouter from "./auth.routes.js";
import workoutRouter from "./workout.routes..js";


const allRoutes = Router();

// Define default routes with their respective paths and routers
const defaultRoutes = [
  {
    path: "/user",
    route: userRouter,
  },
  {
    path: "/auth",
    route: authRouter,
  },
  {
    path: "/workout",
    route: workoutRouter,
  },
];

// Loop through the routes and use them with the main router
defaultRoutes.forEach((route) => {
  allRoutes.use(route.path, route.route);
});

export default allRoutes;
