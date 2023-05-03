import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

import prismadb from "@/lib/prismadb";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

interface SessionInterface {
  user?: {
    email: string;
  };
}

const serverAuth = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions);

  if (!isSessionInterface(session)) {
    throw new Error("Invalid session object");
  }

  if (!session.user?.email) {
    throw new Error("Not signed in");
  }

  const currentUser = await prismadb.user.findUnique({
    where: {
      email: session.user.email,
    },
  });

  if (!currentUser) {
    throw new Error("Not signed in");
  }

  return { currentUser };
};

function isSessionInterface(session: any): session is SessionInterface {
  return session && session.user && typeof session.user.email === "string";
}

export default serverAuth;
