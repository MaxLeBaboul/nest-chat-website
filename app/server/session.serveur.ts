import { createCookieSessionStorage, redirect } from "@remix-run/node";

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage({
    cookie: {
      name: "__session",
      secrets: ["s3cret1"],
    },
  });

export const getUserToken = async ({ request }: { request: Request }) => {
  const cookies = request.headers.get("cookie");
  const session = await getSession(cookies);
  return session.get("userToken");
};

export const commitUserToken = async ({
  request,
  userToken,
}: {
  request: Request;
  userToken: string;
}) => {
  const cookies = request.headers.get("cookie");
  const session = await getSession(cookies);
  session.set("userToken", userToken);

  return await commitSession(session);
};

export const logout = async ({ request }: { request: Request }) => {
  const cookies = request.headers.get("cookie");
  const session = await getSession(cookies);
  const destroyedSession = await destroySession(session);

  return redirect("/", {
    headers: {
      "Set-Cookie": destroyedSession,
    },
  });
};

export const authenticateUser = async ({
  request,
  userToken,
}: {
  request: Request;
  userToken: string;
}) => {
  const createSession = await commitUserToken({ request, userToken });
  return redirect("/", {
    headers: {
      "Set-Cookie": createSession,
    },
  });
};
