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
import { UpdateCategorySchema } from "@/queries/admin/categories/types";

interface UpdateCategoryFormProps {
  data: any;
}

export const UpdateCategoryForm = ({ data }: UpdateCategoryFormProps) => {
  const form = useForm<z.infer<typeof UpdateCategorySchema>>({
    defaultValues: {
      id: data.id,
      name: data.name,
      parent_id: data.parent_id,
    },
    resolver: zodResolver(UpdateCategorySchema),
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
