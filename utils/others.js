import chalk from "chalk";
import path from "path";
import crypto from "crypto";


export const colorizeText = (text, color) => {
  if (chalk[color]) {
    return chalk[color](text);
  } else {
    console.warn(`Color '${color}' is not supported by chalk.`);
    return text;
  }
};

export const globalResponse = (req, res, next) => {
  const originalJson = res.json;
  res.json = function (data) {
    if (res.statusCode < 300) {
      console.log(
        `${colorizeText("Response Message :", "yellow")} ${colorizeText(
          data?.message,
          "green"
        )}`
      );
    } else {
      console.log(
        `${colorizeText("Error Message :", "yellow")} ${colorizeText(
          data?.message,
          "red"
        )}`
      );
    }
    originalJson.call(this, data);
  };
  next();
};

export const generateUniqueName = (originalname) => {
  const ext = path.extname(originalname);
  const uniqueSuffix = `${Date.now()}_${crypto.randomBytes(6).toString("hex")}`;
  return `${uniqueSuffix}${ext}`;
};
