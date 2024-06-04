const jwt = require('jsonwebtoken');
const jwksRsa = require('jwks-rsa');
require("dotenv").config();

const authMiddlewareAdmin = (req, res, next) => {
    const { authorization } = req.headers;

    const DEV_MODE = process.env.DEV_MODE;
    let AUDIENCE;

    if (DEV_MODE == "true"){
      AUDIENCE = process.env.AUDIENCE_TEST;
    }
    else if (DEV_MODE == "false"){
      AUDIENCE = process.env.AUDIENCE_PROD_ADMIN;
    }
  
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  
    const token = authorization.split(' ')[1];
  
    const client = jwksRsa({
      jwksUri: 'https://YOUR-AUTH0-DOMAIN.jp.auth0.com/.well-known/jwks.json',
    });
  
    const options = {
      audience: AUDIENCE,
      issuer: 'https://YOUR-AUTH0-DOMAIN.jp.auth0.com/',
      algorithms: ['RS256'],
    };
  
    jwt.verify(token, getKey, options, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      else if (req.body.email === "admin_email@example.com" && decoded.email === "admin_email@example.com"){
        req.user = decoded;
        next();
      }
      else if (req.body.email === "2nd_admin_email@example.com" && decoded.email === "2nd_admin_email@example.com"){
        req.user = decoded;
        next();
      }
      else {
        res.status(401).send("Unauthorized");
      }
    });
  
    function getKey(header, callback) {
      client.getSigningKey(header.kid, (err, key) => {
        if (err) {
          return callback(err);
        }
  
        const signingKey = key.publicKey || key.rsaPublicKey;
        callback(null, signingKey);
      });
    }
  };

  exports.authMiddlewareAdmin = authMiddlewareAdmin;