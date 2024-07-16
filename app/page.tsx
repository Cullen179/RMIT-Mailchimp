"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { string, z } from "zod";
import * as XLSX from "xlsx";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { getMailchimp } from "./action";
import { useDeferredValue, useState, useTransition } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";

const FormSchema = z.object({
  url: z.string().url({
    message: "Please enter a valid URL.",
  }),
  authorization: z.string(),
});

interface Member {
  listID: string,
  memberID: string,
  memberEmail: string,
}

interface List {
  id: string,
  name: string,
  num_members: number,
}

export default function InputForm() {
  const [fetchData, setFetchData] = useState(null);
  const [_, startTransition] = useTransition();
  const deferredFetchData = useDeferredValue(fetchData);
  const [progress, setProgress] = useState("");

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      url: "https://us14.api.mailchimp.com/3.0/lists?count=1",
      authorization: "apikey 836df3e0db3dbcd1fad9abe0de62f08b-us14",
    },
  });

  async function exportCSV(url: string, authorization: string, fetchData: any) {
    
    // Collect promises from the map function
    const promises = fetchData.lists.map(async (eachList: any) => {

      const workbook = XLSX.utils.book_new();
      const member_count = eachList.stats.member_count + eachList.stats.unsubscribe_count;
      const offset = member_count % 1000 + 1;
      
      let memberData: Member[] = []; 

      for (let i = 0; i < offset + 1; i++) {
        let members = await getMailchimp(
          `${url}/${eachList.id}/members?offset=${offset}&count=1000`,
          authorization
        );

        members.members?.map((eachMember: any) => {
          return {
            listID: eachList.id,
            memberID: eachMember.id,
            memberEmail: eachMember.email_address,
          };
        });
        memberData = memberData.concat(members);
      }
        

      const memberSheet = XLSX.utils.json_to_sheet(memberData);
      const max_memberID_length = memberData.reduce((w: number, r: Member) => Math.max(w, r.memberID.length), 0);
      const max_memberEmail_length = memberData.reduce((w: number, r: Member) => Math.max(w, r.memberEmail.length), 0);
      
      memberSheet["!cols"] = [{ wch: eachList.id.length }, { wch: max_memberID_length }, { wch: max_memberEmail_length }];
      
      const listData = {
        listID: eachList.id,
        listName: eachList.name,
        num_members: member_count,
      };
      
      const listSheet = XLSX.utils.json_to_sheet([listData]);
      listSheet["!cols"] = [{ wch: listData.listID.length }, { wch: listData.listName.length }, { wch: listData.num_members.toString().length }];

      try {
        XLSX.utils.book_append_sheet(workbook, listSheet, "Audience List");
        XLSX.utils.book_append_sheet(workbook, memberSheet, "Members");
        XLSX.writeFile(workbook, eachList.name + ".xlsx", { compression: true });
        setProgress(progress => "Append sheet: " + eachList.name);
      } catch (error) {
        console.log("error append sheet: " + eachList.name);
      }
    });

    // Wait for all promises to resolve
    await Promise.all(promises);
    setProgress(progress => "");
  }

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setProgress(progress => "Fetching data...");
    const fetchData = await getMailchimp(data.url, data.authorization);
    await startTransition(() => {
      setFetchData(data => fetchData);
    });
    setProgress((progress) => "Exporting CSV...");
    exportCSV(data.url, data.authorization, fetchData);
  }

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-2/3 space-y-6"
        >
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Url</FormLabel>
                <FormControl>
                  <Input
                    placeholder="URL"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  This is your /list Mailchimp URL.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="authorization"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Authorization</FormLabel>
                <FormControl>
                  <Input
                    placeholder="API Key"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  This is your Header Authorization.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="space-x-2 flex items-center">
            <Button
              type="submit"
              disabled={progress !== ""}
            >
              {progress !== "" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Export Data
            </Button>
            <div className="text-slate-400">{progress}</div>
          </div>
        </form>
      </Form>
      <pre className="rounded-md bg-slate-950 p-4 border mt-4 w-full">
        <ScrollArea className="h-72 w-full">
          <code className="text-white">
            {deferredFetchData
              ? JSON.stringify(deferredFetchData, null, 2)
              : "No data yet"}
          </code>
        </ScrollArea>
      </pre>
    </div>
  );
}
