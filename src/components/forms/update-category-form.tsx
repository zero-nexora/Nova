"use client";

import { useForm } from "react-hook-form";
import { UpdateCategorySchema } from "@/lib/types";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
} from "../ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";

interface UpdateCategoryFormProps {
  data: any;
}

export const UpdateCategoryForm = ({ data }: UpdateCategoryFormProps) => {
  const form = useForm<z.infer<typeof UpdateCategorySchema>>({
    defaultValues: {
      id: data.id,
      name: data.name,
      parent_id: data.parent_id,
      is_deleted: data.is_deleted,
    },
    resolver: zodResolver(UpdateCategorySchema),
    mode: "onChange",
  });

  const isLoading = form.formState.isLoading;

  return (
    <Card className="bg-transparent">
      <CardContent >
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
      </CardContent>
    </Card>
  );
};
