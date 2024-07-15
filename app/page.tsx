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

// interface ListAudience {
//   name: string;
//   list: string[] | string;
// }

export default function InputForm() {
  const [fetchData, setFetchData] = useState(null);
  const [_, startTransition] = useTransition();
  const deferredFetchData = useDeferredValue(fetchData);
  const [progress, setProgress] = useState("");

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      url: "",
      authorization: "",
    },
  });

  async function exportCSV(url: string, authorization: string, fetchData: any) {
    // let allAudience: ListAudience[] = [];
    const workbook = XLSX.utils.book_new();

    // Collect promises from the map function
    const promises = fetchData.lists.map(async (eachList: any) => {
      const name = eachList.name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 30);

      const members = await getMailchimp(
        `${url}/${eachList.id}/members`,
        authorization
      );
      const emails = members.members.map((eachMember: any) => {
        // if (
        //   allAudience.some(
        //     (element) => element.name === eachMember.email_address
        //   )
        // ) {
        //   const index = allAudience.findIndex(
        //     (element) => element.name === eachMember.email_address
        //   );
        //   allAudience[index].list.push(eachList.name);
        // } else {
        //   allAudience.push({
        //     name: eachMember.email_address,
        //     list: [eachList.name],
        //   });
        // }
        return eachMember.email_address;
      });

      const worksheet = XLSX.utils.json_to_sheet(
        emails.map((email: string) => ({ email }))
      );

      const max_length = emails.reduce((w: number, r: string) => Math.max(w, r.length), 0);
      worksheet["!cols"] = [{ wch: max_length }];

      try {
        XLSX.utils.book_append_sheet(workbook, worksheet, name);
        setProgress(progress => "Append sheet: " + name);
      } catch (error) {
        console.log("error append sheet: " + name);
      }
    });

    // Wait for all promises to resolve
    await Promise.all(promises);

    // allAudience = allAudience.map((eachAudience) => ({
    //   name: eachAudience.name,
    //   list: (eachAudience.list.join(",")),
    // }));
    // // Add the allAudience sheet if needed
    // const allAudienceSheet = XLSX.utils.json_to_sheet(allAudience);
    // const max_length = allAudience.reduce((w, r) => Math.max(w, r.name.length), 0);
    // allAudienceSheet["!cols"] = [{ wch: max_length }];
    // XLSX.utils.book_append_sheet(workbook, allAudienceSheet, "All Audience");

    // Write the workbook to a file
    XLSX.writeFile(workbook, "mailchimp.xlsx", { compression: true });
    setProgress(progress => "");
  }

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    const fetchData = await getMailchimp(data.url, data.authorization);
    await startTransition(() => {
      setFetchData(fetchData);
    });
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
