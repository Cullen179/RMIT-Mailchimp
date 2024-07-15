'use server';

import * as XLSX from "xlsx";
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
