// import {NextApiRequest, NextApiResponse} from "next";
// import {getSession} from "next-auth/react";
//
// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//     if (req.method === 'POST') {
//         return;
//     }
//
//     const session =await getSession({req:req});
//     if (!session){
//         res.status(401).json({message: "Not autheticated" });
//         return;
//     }
//     const userEmail= session.user?.email
//     const oldPassword =req.body.oldpassword
// }