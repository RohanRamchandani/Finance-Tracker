import { getOrCreateDefaultUser, listCategories } from "@/lib/queries";

export async function GET() {
  const user = await getOrCreateDefaultUser();
  const categories = await listCategories(user.id);
  return Response.json({ categories });
}
