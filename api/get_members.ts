import { Member } from "@/app/page";
import { NextApiRequest, NextApiResponse } from "next";

export default function getMembers(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case "GET":
      return res.status(200).json([
        {
          memberEmail: "test"
        },
      ]);
      // const authorization = req.headers.authorization as string;
      // const { url } = req.body;
      // const listID = url.substring(url.lastIndexOf("/"));

      // let memberData: Member[] = [];
      // const members = await fetch(url, {
      //   method: "GET",
      //   headers: {
      //     Authorization: authorization,
      //   },
      // })
      //   .then((res) => res.json())
      //   .then((data) => {
      //     return data.stats.member_count + data.stats.unsubscribe_count;
      //   });

      // const offset = Math.floor(members / 500) + 1;
      // for (let i = 0; i < offset; i++) {
      //   const members = await fetch(
      //     `${url.substring(
      //       0,
      //       url.lastIndexOf("?")
      //     )}/${listID}/members?offset=${i}&count=500`,
      //     {
      //       method: "GET",
      //       headers: {
      //         Authorization: authorization,
      //       },
      //     }
      //   )
      //     .then((res) => res.json())
      //     .then((data) => {
      //       return data.members.map((data: any) => {
      //         return {
      //           memberEmail: data.email_address,
      //         } as Member;
      //       });
      //     });
      //   memberData = memberData.concat(members);
      // }
      // res.status(200).json(memberData);

      break;
    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
