import jwt from "jsonwebtoken";

export async function Decode(req, res) {


    const data = jwt.verify(req.body.code, process.env.JWT_SECRET, { ignoreExpiration: false })

    res.status(200).json(data)
}
export default Decode