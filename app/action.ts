'use server';
import { list } from "postcss";
import { Member } from "./page";
export async function getMailchimp(url: string, apiKey: string) {
  const mailchimpData = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `${apiKey}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
        return data;
    });

  return mailchimpData;
}

export async function getMembers(url: string, apiKey: string, listID: string) {
  const members = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `${apiKey}`,
    },
  })
    .then((res) => res.json())
      .then((data) => {

        return data.members.map((data: any) => {
            return {
                listID: listID,
                memberID: data.id,
                memberEmail: data.email_address,
            } as Member;
        });
    });
    
  return members;
}

export async function deleteList(url: string, apiKey: string, listName: string) {
  await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `${apiKey}`,
    },
  });
  console.log("Deleted list: " + listName);
}

