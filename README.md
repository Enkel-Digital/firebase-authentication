# @enkeldigital/firebase-authentication
Plugin to use with [this library](https://www.npmjs.com/package/create-express-auth-middleware) to integrate with firebase authentication.


## Installation
```shell
npm install @enkeldigital/firebase-authentication

# Depends on this too
npm install create-express-auth-middleware
```


## Example
1. Make a API call from client [using this example](https://github.com/Enkel-Digital/simpler-fetch/blob/master/firebase-auth.md) to include an Authorization header
    ```
    Authorization: Bearer <your-client-token>
    ```

2. If an API call is made with a valid token, you can access the decoded token object from request
    ```js
    const app = require("express")();
    const { create_authn_middleware, create_authz_middleware } = require("create-express-auth-middleware");
    const firebaseAuthentication = require("@enkeldigital/firebase-authentication");
    const { auth } = require("@enkeldigital/firebase-admin");

    // Make all routes in this express app to be authentication protected.
    // Meaning all routes defined later can only be called if a valid JWT is provided.
    // This DOES NOT mean that routes are fully protected yet,
    // as you need to ensure users have sufficient permission to access APIs using authorization middleware.
    app.use(create_authn_middleware(firebaseAuthentication(auth)));

    // The actual route that requires both authentication and authorization to run.
    app.get(
        "/data/:userID",

        // Add authorization middleware to ensure users can only access their own data
        // Checks that the specified userID in the URL matches user's own userID value in their 'DecodedIdToken'
        // The 'jwt' property is set by the authentication middleware that is registered above
        create_authz_middleware((req) => req.jwt.userID === req.params.userID),

        // This request handler will only run if both predicate above returns true!
        (req, res) => res.status(200).json({ data: "Protected user data" })
    );
    ```

3.  If authentication failed, you get a 401 code with the following response by default
    ```json
    { "ok": false, "error": "Authentication Failed" }
    ```

4.  If authorization failed, you get a 403 code with the following response by default
    ```json
    { "ok": false, "error": "Authorization Failed" }
    ```


## License and Author
This project is made available under MIT LICENSE and written by [JJ](https://github.com/Jaimeloeuf)