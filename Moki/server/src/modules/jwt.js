// jwt.js hold the json web token implementation
const { isRequireJWT } = require('./config');
const { cfg } = require('../modules/config');

const hfName = 'x-amzn-oidc-data';

//get domain id
function parseBase64(token) {
  if (!token) {
    return 'redirect';
  }
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const dataJSON = JSON.parse(Buffer.from(base64, 'base64').toString());
  return dataJSON;
}

/**
 * check if user is admin, superadmin, self-service or redirect
 * - first of all grant * access if access via localhost
 * - if JWT required, validate it, and pass proper grants on success, deny otherwise
 * - otherwise assume the access is configured to be protected otherwise and grant *
 * 
 * for admin mode return *
 * for domain mode return domain filter
 * for user mode return filter for attrs.from, attrs.to, attrs.r-uri  and also domain filter
 */
async function getJWTsipUserFilter(req) {
  // localhost query -- open up
  /* if (req.connection.remoteAddress === '127.0.0.1') {
       console.log("ACCESS getJWTsipUserFilter: permitted for localhost source");
       // see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
       // this is implicit Promise like if there was "return Promise.resolve("*")
       return  "*";
   }
*/

  //check if web access - allow it without user logins
  if (req.originalUrl.startsWith("/api/web")) {
    if (cfg.debug) console.info("web access no need fot user filter");
    return "*";
  }
  // check config if JWT required
  let isAccept;
  try {
    isAccept = await isRequireJWT();
  } catch (e) {
    // error in config processing:
    console.log("ACCESS getJWTsipUserFilter: error in config processing: ", JSON.stringify(e));
    // this will return a promise reject
    //  https://stackoverflow.com/questions/42453683/how-to-reject-in-async-await-syntax
    throw new Error("error in config processing");
  }

  // JWT not required -- open up 
  if (!isAccept) {
    console.log(`ACCESS getJWTsipUserFilter: * permitted because no JWT required`);
    return "*";
  }

  // token required but not present -- decline, if not web dashboard access
  if (req.headers[hfName] === undefined) {
    console.log("ACCESS getJWTsipUserFilter: token required but not present");
    throw new Error("ACCESS: token missing");
  }
  // token required but empty -- decline
  if (req.headers[hfName] === "") {
    console.log("ACCESS getJWTsipUserFilter: token required but empty");
    throw new Error("ACCESS: token empty");
  }

  // JWT required -- parse it and validate it
  let parsedHeader;
  try {
    parsedHeader = parseBase64(req.headers[hfName]);
  } catch (e) {
    console.log("ACCESS getJWTsipUserFilter: JWT parsing failed");
    throw new Error("ACCESS: JWT parsing error");
  }
  console.log("parsed Header: ", JSON.stringify(parsedHeader));
  const sip = parsedHeader['custom:sip'];
  let jwtbit = parsedHeader['custom:adminlevel'];
  const domainID = parsedHeader['custom:domainid'];
  const subId = parsedHeader.sub;

  // subscriber id and admin level must be always set
  if (subId === undefined) {
    console.log("ACCESS getJWTsipUserFilter: no sub defined ");
    throw new Error("ACCESS: no  sub defined");
  }
  if (jwtbit === undefined) {
    console.log("ACCESS getJWTsipUserFilter: no admin-level defined ");
    throw new Error("ACCESS: no  admin-level defined");
  }

  jwtbit = parseInt(jwtbit);
  // Root SuperAdmin Level
  if (jwtbit === 0) {
    console.log(`ACCESS: JWT admin level 0, NO FILTERS for user ${subId}`);
    return { "domain": "*" };
  }
  // less privileged users must belong to a domain
  if (domainID === undefined) {
    console.log(`ACCESS getJWTsipUserFilter: no domain defined for user ${subId}`);
    throw new Error("ACCESS: no  domain defined");
  }
  // Site-Admin level
  if (jwtbit === 1) {
    if (domainID === subId) {
      console.log(`ACCESS: SITE OWNER, Domain Filter Applied: ${domainID} for user ${subId}`);
      return { "domain": domainID };
    }
    else {
      console.log(`ACCESS: SITE ADMIN, Domain Filter Applied: ${domainID} and user filter ${subId}`);
      let userfilter = `domain: ${subId}`;
      return { "domain": domainID, "userFilter": userfilter };
    }

  }
  // End-User level
  if (jwtbit === 2) {
    if (sip === undefined) {
      console.log(`ACCESS getJWTsipUserFilter: no SIP URI for an end-user: ${subId}`);
      throw new Error("ACCESS: no SIP URI for an end-user");
    }
    if (sip === 'redirect') {
      console.log(`ACCESS getJWTsipUserFilter: no valid SIP URI for an end-user: ${subId}`);
      throw new Error("ACCESS: no valid SIP URI for an end-user");
    }
    //create user filter
    const colon = sip.indexOf(':');
    const user = [sip.substr(0, colon), String.fromCharCode(92), sip.substr(colon)].join('');
    let userfilter = `attrs.from.keyword: ${user}  OR attrs.to.keyword: ${user} OR attrs.r-uri: ${user}`;
    console.log(`ACCESS: User Level 2, Activating Domain -${domainID}- and SIP -${user}- Filter for user ${subId}`);
    return { "domain": domainID, "userFilter": userfilter };
  }
  // no well-known admin-level found exit with error
  console.log(`ACCESS getJWTsipUserFilter: unexpected admin level ${jwtbit} for user ${subId}`);
  throw new Error(`ACCESS: unexepcted admin level: ${jwtbit}`);
}


/*
return if encrypt checksum filter should be used
*/
function getEncryptChecksumFilter(req) {
  let parsedHeader;
  try {
    parsedHeader = parseBase64(req.headers[hfName]);
  } catch (e) {
    console.log("ACCESS getJWTsipUserFilter: JWT parsing failed");
    //no header, nginx auth or whatever
    return { encryptChecksum: "*" };
  }

  let jwtbit = parsedHeader['custom:adminlevel'];
  jwtbit = parseInt(jwtbit);

  //admin, no encrypt checksum filter
  if (jwtbit === 0) { return { encryptChecksum: "*" }; }
  //no encrypt checksum passed from client

  else if (!req.body.encryptChecksum) { return { encryptChecksum: "*" }; }
  else if (req.body.encryptChecksum === "anonymous") { return { encryptChecksum: "anonymous" }; }

  //no password was used for decryption, show only unecrypted events -> plain state
  //user or site admin, use filter
  else { return { encryptChecksum: req.body.encryptChecksum }; }
}

module.exports = {
  getJWTsipUserFilter,
  parseBase64,
  getEncryptChecksumFilter
};
