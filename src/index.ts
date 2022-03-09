import type { Auth } from "firebase-admin/auth";
import type { Request } from "express";

/**
 * @name firebaseAuthentication
 */
export default (firebaseAuth: Auth) =>
  async function (
    req: Request
  ): Promise<boolean | { status: number; error: string }> {
    // Get auth token if available
    // Note that headers are all lowercased by express
    if (req.headers.authorization) {
      const authHeader = req.headers.authorization.split(" ");

      // // Check if the auth header follows the "bearer" pattern
      if (authHeader[0] === "Bearer") {
        // https://firebase.google.com/docs/auth/admin/verify-id-tokens#verify_id_tokens_using_the_firebase_admin_sdk
        // The verifyIdToken needs a project ID, but should be taken care of if firebase admin has been initialised properly or runs on gcp infra
        //
        // Attach decoded token to req object to use downstream
        // Users can choose what key to attach the decoded token to.
        //
        // Can assume to be string, if not string, firebase auth code will throw an error
        req.jwt = await firebaseAuth.verifyIdToken(authHeader[1] as string);

        // Break out of this middleware and continue with the next one
        return true;
      }
      // If token missing or token malformed, end the request in this middleware
      // 401 Missing auth token thus unauthorised
      else
        return {
          status: 401,
          error: "Unexpected Auth header pattern, expects bearer pattern",
        };
    } else return { status: 401, error: "Missing auth header" };
  };
