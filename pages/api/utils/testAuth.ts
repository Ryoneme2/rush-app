import nextConnect from "next-connect";
import authMiddleware from "./verify.middlewere";

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

apiRoute.use(authMiddleware);

apiRoute.get((req: any, res: any) => {
  res.status(200).json({ data: req.user });
});

export default apiRoute;
