// components/category-stats.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Category } from "@/stores/admin/categories-store";
import {
  Folder,
  FolderOpen,
  Archive,
  TrendingUp,
  Calendar,
  BarChart3,
} from "lucide-react";
import { useMemo } from "react";

interface CategoryStatsProps {
  categories: Category[];
}

export const CategoryStats = ({ categories }: CategoryStatsProps) => {
  const stats = useMemo(() => {
    const total = categories.length;
    const active = categories.filter((cat) => !cat.is_deleted).length;
    const deleted = categories.filter((cat) => cat.is_deleted).length;
    const totalSubcategories = categories.reduce(
      (sum, cat) => sum + cat.subcategories.length,
      0
    );
    const categoriesWithImages = categories.filter(
      (cat) => cat.image_url
    ).length;
    const imagePercentage =
      total > 0 ? Math.round((categoriesWithImages / total) * 100) : 0;

    // Recent categories (created in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentCategories = categories.filter(
      (cat) => new Date(cat.created_at) > sevenDaysAgo
    ).length;

    return {
      total,
      active,
      deleted,
      totalSubcategories,
      categoriesWithImages,
      imagePercentage,
      recentCategories,
    };
  }, [categories]);

  const statsConfig = [
    {
      title: "Total Categories",
      value: stats.total,
      icon: Folder,
      description: "All categories",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Active Categories",
      value: stats.active,
      icon: FolderOpen,
      description: "Currently active",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Deleted Categories",
      value: stats.deleted,
      icon: Archive,
      description: "In trash",
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Total Subcategories",
      value: stats.totalSubcategories,
      icon: BarChart3,
      description: "All subcategories",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      {statsConfig.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-md ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}

      {/* Additional Stats Row */}
      <Card className="md:col-span-2 lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Quick Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Categories with images
            </span>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {stats.categoriesWithImages}/{stats.total}
              </Badge>
              <Badge variant="secondary">{stats.imagePercentage}%</Badge>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Recent (7 days)
            </span>
            <Badge variant={stats.recentCategories > 0 ? "default" : "outline"}>
              {stats.recentCategories} new
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Avg. subcategories
            </span>
            <Badge variant="outline">
              {stats.total > 0
                ? (stats.totalSubcategories / stats.total).toFixed(1)
                : "0"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Health Score Card */}
      <Card className="md:col-span-2 lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Category Health
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Active Rate</span>
              <span className="font-medium">
                {stats.total > 0
                  ? Math.round((stats.active / stats.total) * 100)
                  : 0}
                %
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all"
                style={{
                  width: `${
                    stats.total > 0 ? (stats.active / stats.total) * 100 : 0
                  }%`,
                }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Image Coverage</span>
              <span className="font-medium">{stats.imagePercentage}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${stats.imagePercentage}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
