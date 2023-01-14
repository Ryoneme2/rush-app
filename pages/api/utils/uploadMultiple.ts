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

// // Returns middleware that processes multiple files sharing the same field name.
// const uploadMiddleware = upload.array("theFiles");

// // Adds the middleware to Next-Connect
// // apiRoute.use(uploadMiddleware);

// // Process a POST request
apiRoute.post(upload.array("images"), (req: any, res: any) => {
  req.files = req.files.map((x) => {
    x.path = x.path.replace("public", "");
    return x;
  });
  res.status(200).json({ data: req.files });
});

export default apiRoute;
export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};
