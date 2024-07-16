'use server';
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

export async function getMembers(url: string, apiKey: string) {
  const members = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `${apiKey}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
        return {
            listID: data.list_id,
            memberID: data.id,
            memberEmail: data.email_address,
      } as Member;
    });

  return members;
}


