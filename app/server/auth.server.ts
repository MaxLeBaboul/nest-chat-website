import { z } from "zod";
import { getUserToken, logout } from "./session.serveur";

const getAuthenticationUserSchema = z.object({
  email: z.string().email(),
  id: z.string(),
  firstName: z.string(),
});

export const getAuthenticatedUser = async ({
  request,
}: {
  request: Request;
}) => {
  const userToken = await getUserToken({ request });
  if (!userToken) {
    return null;
  }
  try {
    //on Appellle notre API Nestjs avec les données du fotmulaire
    const response = await fetch("http://localhost:8000/auth", {
      //method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      //body: JSON.stringify(jsonData),
    });

    const data = await response.json();
    return getAuthenticationUserSchema.parse(data);
  } catch (error) {
    console.error(error);
    throw await logout({ request });
  }
};
