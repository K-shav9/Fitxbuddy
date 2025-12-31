import morgan from "morgan";
import chalk from "chalk";
import { colorizeText } from "./others.js";

morgan.token("source", function (req) {
  return req.get("User-Agent") || "Unknown Source";
});

function customFormat(tokens, req, res) {
  const status = res.statusCode;
  const color = status >= 200 && status < 300 ? chalk.green : chalk.red;

  const methodAndUrl = color(
    `${tokens.method(req, res)} ${tokens.url(req, res)}`
  );

  const hitFrom = chalk.green(tokens.source(req));

  return `${colorizeText("API Route: ", "yellow")} "${methodAndUrl}" Status: ${color(status)}`;
}

export { morgan, customFormat };
