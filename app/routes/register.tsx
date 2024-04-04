import {
  ActionFunctionArgs,
  json,
  redirect,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { z } from "zod";
import { getOptionalUser } from "~/server/auth.server";
import { authenticateUser } from "~/server/session.serveur";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string(),
});

const tokenSchema = z.object({
  access_token: z.string().optional(),
  message: z.string().optional(),
  error: z.boolean().optional(),
});

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getOptionalUser({ request });
  if (user) {
    console.log("vous êtes déjà connectés");

    return redirect("/");
  }

  return json({});
};

export const action = async ({ request }: ActionFunctionArgs) => {
  //Récupérer les infos du formulaire
  const formData = await request.formData();
  const jsonData = Object.fromEntries(formData);
  const parsedJson = registerSchema.safeParse(jsonData);

  if (parsedJson.success === false) {
    const { error } = parsedJson;
    return json({
      error: true,
      message: error.errors.map((err) => err.message).join(","),
    });
  }
  //on Appellle notre API Nestjs avec les données du fotmulaire
  const response = await fetch("http://localhost:8000/auth/register", {
    method: "POST",
    body: JSON.stringify(jsonData),
    headers: {
      "Content-Type": "application/json",
    },
  });

  //En cas de succès, on récupère le token
  const { access_token, message, error } = tokenSchema.parse(
    await response.json()
  );
  if (error) {
    return json({ message, error });
  }
  if (access_token) {
    return await authenticateUser({
      request,
      userToken: access_token,
    });
  }

  return json({ error: true, message: "Une erreur est survenue" });
};

export default function RegisterForm() {
  const formFeedBack = useActionData<typeof action>();
  return (
    <Form method="POST">
      <input type="text" name="firstName" placeholder="firstName" required />
      <input type="email" name="email" placeholder="Email" required />
      <input type="password" name="password" placeholder="Password" required />

      {formFeedBack?.message ? (
        <span style={{ color: formFeedBack?.error ? "red" : "green" }}>
          {formFeedBack.message}
        </span>
      ) : null}
      <button type="submit">Créer votre compte</button>
    </Form>
  );
}
