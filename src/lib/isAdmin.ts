import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

export const isAdmin = async () => {
  const session = await getServerSession(authOptions);
  return session?.user?.email === process.env.ADMIN_EMAIL;
};
