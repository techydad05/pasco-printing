import * as auth from '$lib/server/auth.js';

const handleAuth = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get(auth.sessionCookieName);

	if (!sessionToken) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const { session, user } = await auth.validateSessionToken(sessionToken);

	if (session) {
		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
	} else {
		auth.deleteSessionTokenCookie(event);
	}

	event.locals.user = user;
	event.locals.session = session;
	return resolve(event);
};

export async function handle({ event, resolve }) {
  console.log('Handling request:', event.url.pathname);
  
  try {
    const response = await handleAuth({ event, resolve });
    console.log('Response status:', response.status);
    return response;
  } catch (error) {
    console.error('Server error:', error);
    if (error instanceof Error) {
      console.error(error.stack);
    }
    return new Response('Internal Server Error', { status: 500 });
  }
}
