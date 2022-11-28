import { Request } from "express";

import fs from "fs";

import path from "path";

import util from "util";

import multer from "multer";

const multerConfig = {
  maxSize: 1024 * 1024 * 5,
  fileMime: [
    "image/jpg",
    "image/png",
    "image/jpeg",
    "application/octet-stream",
  ],
  fileExt: [".jpg", ".png", ".jpeg", ".mp4", ".mov", ".flv", ".wmv", ".avi"],
};

class ConfigurationAvatar {
  private storage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, callback) => {
      try {
        const dir = "./public/avatars/";

        fs.mkdirSync(dir, { recursive: true });

        callback(null, dir);
      } catch (error) {
        callback(error, null);
      }
    },

    filename: (req: Request, file: Express.Multer.File, callback) => {
      callback(null, `${Date.now()}_${file.originalname}`);
    },
  });

  private fileFilter = (
    req: Request,
    file: Express.Multer.File,
    callback: multer.FileFilterCallback
  ) => {
    try {
      const mimetype = multerConfig.fileMime.includes(file.mimetype);

      const extname = multerConfig.fileExt.includes(
        path.extname(file.originalname)
      );

      if (mimetype && extname) {
        return callback(null, true);
      }
    } catch (error) {
      return callback(error, false);
    }
  };

  public upload = multer({
    storage: this.storage,

    fileFilter: this.fileFilter,

    // limits: { fileSize: 1024 * 1024 * 5 },
  });
}

Object.seal(ConfigurationAvatar);

export const upload = new ConfigurationAvatar().upload;

export const uploadAvatar = util.promisify(upload.single("file"));
