import { deleteTransaction, getOrCreateDefaultUser } from "@/lib/queries";

export async function DELETE(
  _request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const user = await getOrCreateDefaultUser();
  const removed = await deleteTransaction(user.id, id);

  if (!removed) {
    return Response.json({ error: "Transaction not found." }, { status: 404 });
  }
  return Response.json({ ok: true });
}
