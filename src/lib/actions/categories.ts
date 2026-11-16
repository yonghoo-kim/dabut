"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { CATEGORY_ICONS } from "@/components/ledger/category-icon";

export type CreatedCategory = {
  id: string;
  name: string;
  type: "expense" | "income";
  icon: string | null;
};

export type CreateCategoryResult = { category?: CreatedCategory; error?: string };

const MAX_NAME_LENGTH = 12;
const MAX_ICON_LENGTH = 16;

export async function createCategory(input: {
  type: "expense" | "income";
  name: string;
  icon?: string;
}): Promise<CreateCategoryResult> {
  const type = input?.type;
  if (type !== "expense" && type !== "income") return { error: "Invalid category type" };

  const name = (input.name ?? "").trim();
  const nameLength = [...name].length;
  if (nameLength < 1) return { error: "Enter a category name" };
  if (nameLength > MAX_NAME_LENGTH) return { error: `Category name must be ${MAX_NAME_LENGTH} characters or fewer` };

  const icon = (input.icon ?? "").trim();
  if (icon.length > MAX_ICON_LENGTH) return { error: "Invalid icon" };
  const iconKey = Object.prototype.hasOwnProperty.call(CATEGORY_ICONS, icon) ? icon : null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Same scoping as transactions: the user's first connection, else personal.
  const { data: memberships } = await supabase
    .from("connection_members")
    .select("connection_id")
    .eq("user_id", user.id)
    .order("joined_at", { ascending: true })
    .limit(1);
  const connectionId = memberships?.[0]?.connection_id ?? null;

  const { data, error } = await supabase
    .from("categories")
    .insert({
      type,
      name,
      icon: iconKey,
      connection_id: connectionId,
      owner_id: user.id,
    })
    .select("id, name, type, icon")
    .single();
  if (error) {
    if (error.code === "23505") return { error: "A category with that name already exists" };
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  return {
    category: {
      id: data.id,
      name: data.name,
      type: data.type as "expense" | "income",
      icon: data.icon,
    },
  };
}

export type DeleteCategoryResult = { ok?: true; error?: "inUse" | "notAllowed" | "failed"; count?: number };

/**
 * 직접 만든 카테고리 삭제. 기본 카테고리나 다른 사람이 만든 것은 RLS 로 막혀 notAllowed,
 * 이미 내역에 쓰인 카테고리는 내역이 사라지지 않도록 inUse 로 거절한다.
 */
export async function deleteCategory(id: string): Promise<DeleteCategoryResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "notAllowed" };

  const { count } = await supabase
    .from("transactions")
    .select("id", { count: "exact", head: true })
    .eq("category_id", id);
  if (count && count > 0) return { error: "inUse", count };

  const { data, error } = await supabase.from("categories").delete().eq("id", id).select("id");
  if (error) return { error: error.code === "23503" ? "inUse" : "failed" };
  if (!data || data.length === 0) return { error: "notAllowed" };

  revalidatePath("/", "layout");
  return { ok: true };
}
