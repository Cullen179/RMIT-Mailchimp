import { headers } from "next/headers";
import { Member } from "../../page";

// export const dynamic = "force-dynamic"; // defaults to auto

export async function GET(req: Request) {
    const authorization = headers().get("Authorization") as string;
    const url = headers().get("Url") as string;

  let memberData: Member[] = [];
  const members = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: authorization,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      return data.stats.member_count + data.stats.unsubscribe_count;
    });

  const offset = Math.floor(members / 1000) + 1;
    for (let i = 0; i < offset; i++) {
        console.log(
          `${url.substring(
            0,
            url.lastIndexOf("?")
          )}/members?offset=${i}&count=1000&fields=members.email_address`
        );
    const members = await fetch(
      `${url}/members?offset=${i}&count=1000&fields=members.email_address`,
      {
        method: "GET",
        headers: {
          Authorization: authorization,
        },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        return data.members.map((data: any) => {
          return data.email_address;
        });
      });
    memberData = memberData.concat(members);
  }

  return Response.json(memberData);
}
