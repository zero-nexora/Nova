"use client";

import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { createCategorySchema } from "@/queries/admin/categories/types";

export const CreateCategoryForm = () => {
  const form = useForm<z.infer<typeof createCategorySchema>>({
    defaultValues: {
      image_url: "",
      name: "",
      parent_id: null,
      public_id: null,
    },
    resolver: zodResolver(createCategorySchema),
    mode: "onChange",
  });

  const isLoading = form.formState.isLoading;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(() => {})}>
        <FormField
          control={form.control}
          name="name"
          disabled={isLoading}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};
