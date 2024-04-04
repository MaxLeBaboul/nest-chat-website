import { ActionFunctionArgs } from "@remix-run/node";
import { logout } from "~/server/session.serveur";

export const action = async ({ request }: ActionFunctionArgs) => {
  return await logout({ request });
};
