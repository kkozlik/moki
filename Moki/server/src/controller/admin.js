// admin.js hold the admin endpoints

const { parseBase64 } = require('../modules/jwt');
const {
    isRequireJWT
} = require('../modules/config');
const elasticsearch = require('elasticsearch');
var oldJti = "";
const hfName = 'x-amzn-oidc-data';

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Administative management
 */


class AdminController {
    /**
     * @swagger
     * /api/user/sip:
     *   get:
     *     description: Get a JWT for a sip user
     *     tags: [Admin]
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: pretty
     *         description: Return a pretty json
     *         in: query
     *         required: false
     *         type: bool
     *     responses:
     *       200:
     *         description: Sip user
     *       500:
     *         description: internal error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/definitions/Error'
     *             example:
     *               error: "bash: not found"
     */
    static async getSipUser(req, res) {
        /**
         * Add login to ES database
         * index: lastlog-YYYY.MM, rotate every month
         * events: {timestamp, userID, domain, level} type=login
         */
        async function storeLoginInES(domain, userID, jwtbit, email) {
            const client = new elasticsearch.Client({ host: process.env.ES, requestTimeout: 60000 });
            var now = new Date();
            const index = "lastlog-" + now.getFullYear() + "." + (now.getMonth() + 1);
            const existIndex = await client.indices.exists({ index: index });

            if (!existIndex) {
                await client.indices.create({
                    index: index,
                    body: {
                        mappings: {
                            properties: {
                                "@timestamp": { "type": "date", "index": "true" },
                                "user": { "type": "keyword", "index": "true" },
                                "domain": { "type": "keyword", "index": "true" },
                                "email": { "type": "keyword", "index": "true" },
                                "level": { "type": "integer", "index": "true" }
                            }
                        }
                    }
                }, function (err, resp, respcode) {
                    console.error(err, resp, respcode);
                });
            }

            await client.index({
                index: index,
                refresh: true,
                type: "_doc",
                body: {
                    "@timestamp": now,
                    "user": userID,
                    "domain": domain,
                    "email": email,
                    "level": jwtbit
                }
            }, function (err, resp, status) {
                if (err) {
                    console.error(resp);
                } else {
                    console.info("Inserted new login: " + userID + " " + domain);
                }
            })
        }
        // localhost query -- open up
       // if (req.connection.remoteAddress === '127.0.0.1') {
        //    console.log("ACCESS getJWTsipUserFilter: permitted for localhost source");
            // see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
            // this is implicit Promise like if there was "return Promise.resolve("*")
       //     return res.json({ user: 'localhost', aws: false });
       // }

        // check config if JWT required
        var isAccept;
        try {
            isAccept = await isRequireJWT();
        } catch (e) {
            // error in config processing:
            console.log("ACCESS getJWTsipUserFilter: error in config processing: ", JSON.stringify(e));
            // this will return a promise reject
            //  https://stackoverflow.com/questions/42453683/how-to-reject-in-async-await-syntax
            return res.json({ redirect: "errorInConfigProcessing" });
        }

        // JWT not required -- open up 
        if (!isAccept) {
            console.log(`ACCESS getJWTsipUserFilter: * permitted because no JWT required`);
            return res.json({ user: `ADMIN`, aws: false });
        }

        // JWT required -- parse it and validate it
        var parsedHeader;
        try {
            parsedHeader = parseBase64(req.headers[hfName]);
        } catch (e) {
            console.log("ACCESS getJWTsipUserFilter: JWT parsing failed");
            return res.json({ redirect: "JWTparsingError" });
        }

        var parsedHeaderAccessToken;
        try {
            parsedHeaderAccessToken = parseBase64(req.headers['x-amzn-oidc-accesstoken']);
        } catch (e) {
            console.log("ACCESS getJWTsipUserFilter: JTI parsing failed");
            return res.json({ redirect: "JTIparsingError" });
        }
        console.log("parsed Header: ", JSON.stringify(parsedHeader));
        const sip = parsedHeader['custom:sip'];
        const jwtbit = parsedHeader['custom:adminlevel'];
        const domainID = parsedHeader['custom:domainid'];
        const subId = parsedHeader['sub'];
        const email = parsedHeader['email'];
        const jti = parsedHeaderAccessToken['jti'];

        //store login to ES
        if (oldJti !== jti) {
            storeLoginInES(domainID, subId, jwtbit, email);
        }
        oldJti = jti;

        if (jwtbit === undefined) {
            //default user for web dashboard
            return res.json({ user: `DEFAULT`, aws: true });
        }


        // subscriber id and admin level must be always set
        if (subId === undefined) {
            console.log("ACCESS getJWTsipUserFilter: no sub defined ");
            return res.json({ redirect: "noSubID" });
        }

        // Root SuperAdmin Level
        if (jwtbit == 0) {
            console.log(`ACCESS: JWT admin level 0, NO FILTERS for user ${subId}`);
            return res.json({ user: `ADMIN`, aws: true });
        }
        // less privileged users must belong to a domain
        if (domainID === undefined) {
            console.log(`ACCESS getJWTsipUserFilter: no domain defined for user ${subId}`);
            return res.json({ redirect: "nodomainID" });
        }
        // Site-Admin level
        if (jwtbit == 1) {
            console.log(`ACCESS: USER LEVEL 1, Domain Filter Applied: ${domainID} for user ${subId}`);
            return res.json({ user: `SITE ADMIN`, aws: true });
        }
        // End-User level
        if (jwtbit == 2) {
            if (sip === undefined) {
                console.log(`ACCESS getJWTsipUserFilter: no SIP URI for an end-user: ${subId}`);
                return res.json({ redirect: "nosipattr" });
            }
            if (sip === 'redirect') {
                console.log(`ACCESS getJWTsipUserFilter: no valid SIP URI for an end-user: ${subId}`);
                return res.json({ redirect: "nosipattr" });
            }
            //create user filter
            const colon = sip.indexOf(':');
            const user = [sip.substr(0, colon), String.fromCharCode(92), sip.substr(colon)].join('');
            console.log(`ACCESS: User Level 2, Activating Domain -${domainID}- and SIP -${user}- Filter for user ${subId}`);
            return res.json({ user: `USER`, aws: true, name: sip });
        }
        // no well-known admin-level found exit with error
        console.log(`ACCESS getJWTsipUserFilter: unexpected admin level ${jwtbit} for user ${subId}`);
        return res.json({ redirect: "unexcpectedAdminLevel" });
    }


}

module.exports = AdminController;