import type { Auth, DecodedIdToken } from "firebase-admin/auth";
import type { Request } from "express";

/*
  Extending the Request type to add an optional `jwt` property set by this authentication function.
  Since the jwt property is set by this authentication function,
  it can only be accessed by routes defined after registering an authentication middleware using this function.
  Which means that the jwt property is not always set, thats why its an optional property.

  Users could do `req.jwt?.someProp` to skip the undefined check if really needed as an escape hatch.
*/
declare global {
  namespace Express {
    interface Request {
      jwt?: DecodedIdToken;
    }
  }
}

/**
 * @name firebaseAuthentication
 *
 * @param firebaseAuth Firebase's auth service
 * @param checkRevoked Should middleware make network request to firebase auth servers to check if token revoked. Defaults to no checking to prevent the extra network trip as it would slow down the authentication process. Only set if absolutely neccessary.
 *
 * The return type is mainly to ensure that the code in this function adheres to the expected return type,
 * but it is not neccessary to work with the create-express-auth-middleware library.
 */
export default (firebaseAuth: Auth, checkRevoked: boolean = false) =>
  async (req: Request): Promise<boolean | { error: string }> => {
    // Check if auth token is available, note that headers are all lowercased by express
    if (!req.headers.authorization) return { error: "Missing auth header" };

    // Get the authentication scheme and encoded token string from the header string
    const [authScheme, tokenString] = req.headers.authorization.split(" ");

    // Check if Bearer Authentication Scheme is used, end request in this middleware if invalid scheme is used
    if (authScheme !== "Bearer")
      return { error: "Expected Bearer Authentication Scheme" };

    // https://firebase.google.com/docs/auth/admin/verify-id-tokens#verify_id_tokens_using_the_firebase_admin_sdk
    // The verifyIdToken needs a project ID, but should be taken care of if firebase admin has been initialised properly or runs on gcp infra
    //
    // Can assume and type cast auth header's second part as string,
    // because if it is not a string or it is empty, this firebase method will throw an error
    //
    // Attach decoded token to req object to use downstream
    req.jwt = await firebaseAuth.verifyIdToken(
      tokenString as string,
      checkRevoked
    );

    // Break out of this predicate function and indicate that the user is successfully authenticated
    return true;
  };
