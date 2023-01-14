import nextConnect from "next-connect";
import { upload } from "./upload.middleware";

const apiRoute = nextConnect({
  onError(error, req, res: any) {
    res
      .status(501)
      .json({ error: `Sorry something Happened! ${error.message}` });
  },
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
});

apiRoute.post(upload.single("image"), (req: any, res: any) => {
  // req.file.path = req.file.path.replace("public", "");
  /** Save to database */
  res.status(200).json({ data: req.file.location });
});

export default apiRoute;
export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};
