import { NextApiRequest, NextApiResponse } from "next";
import prismadb from "@/lib/prismadb";

import { getSession } from "next-auth/react";
import { without } from "lodash";
import serverAuth from "@/lib/serverAuth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== "POST") {
      return res.status(405).end();
    }

    // const session = await getSession({ req });
    const { currentUser } = await serverAuth(req, res);

    if (!currentUser) {
      throw new Error("Not signed in man");
    }

    const { movieId } = req.body;

    const existingMovie = await prismadb.movie.findUnique({
      where: {
        id: movieId,
      },
    });

    if (!existingMovie) {
      throw new Error("Invalid ID");
    }

    const user = await prismadb.user.findUnique({
      where: {
        email: currentUser.email || "",
      },
    });

    if (!user) {
      throw new Error("Invalid email");
    }

    const updatedFavoriteIds = without(user.favoriteIds, movieId);

    const updatedUser = await prismadb.user.update({
      where: {
        email: currentUser.email || "",
      },
      data: {
        favoriteIds: updatedFavoriteIds,
      },
    });

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.log(error);

    return res.status(500).end();
  }
}
