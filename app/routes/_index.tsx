import { type ActionFunctionArgs, type MetaFunction } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { z } from "zod";
import { useOptionalUser } from "~/root";
import { authenticateUser } from "~/server/session.serveur";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const tokenSchema = z.object({
  access_token: z.string(),
});
export const meta: MetaFunction = () => {
  return [
    { title: "New Chat App" },
    { name: "description", content: "Nest Chat v0!" },
  ];
};

export const action = async ({ request }: ActionFunctionArgs) => {
  //Récupérer les infos du formulaire
  const formData = await request.formData();
  const jsonData = Object.fromEntries(formData);
  const parsedJson = loginSchema.parse(jsonData);

  console.log({ parsedJson });

  //on Appellle notre API Nestjs avec les données du fotmulaire
  const response = await fetch("http://localhost:8000/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(jsonData),
  });

  //En cas de succès, on récupère le token
  const { access_token } = tokenSchema.parse(await response.json());

  return await authenticateUser({ request, userToken: access_token });
};

export default function Index() {
  const user = useOptionalUser();
  const isConnected = user != null;

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h1>Welcome to Nest Chat v0</h1>
      {isConnected ? <h1>Welcome {user.firstName} </h1> : <LonginForm />}
    </div>
  );
}

const LonginForm = () => {
  return (
    <Form method="POST">
      <input type="email" name="email" placeholder="Email" required />
      <input type="password" name="password" placeholder="Password" required />
      <button type="submit">Se connecter</button>
    </Form>
  );
};
